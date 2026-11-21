# howto.vault-client-records-by-conftier

> ⚠️ **not legal advice**, and not tax advice. this brief recommends a way to store client records; confirm retention periods and any record duty with a licensed attorney or CPA.

## .what

a client's `conftier.0` and `conftier.1` records (`define.conftier`) live in a **records vault**: one private s3 bucket, declared with declastruct, behind a **one-way door**.

| who | may |
|---|---|
| the **writer** role — crews and humans alike | add a new record. never read, list, overwrite, or delete one |
| the **conftier.1 reader** — named humans, mfa only | read `conftier.1/` |
| the **conftier.0 reader** — fewer named humans, mfa only | read `conftier.0/` and `conftier.1/` |
| anyone | delete a record: **no one** |

the client's repo holds `conftier.3` only: the narrative, and a **manifest** row per vaulted record, so the record set stays complete and checkable from the repo while the bytes never enter git.

## .why a vault and not a second repo

- **a repo cannot narrow its readers per file, and cannot forget.** every clone holds every commit (`whyto.client-facts-live-in-a-private-tree`). a vault prefix has its own readers and its own key, and a grant can be revoked
- **records are write-once evidence.** pdfs and screenshots do not diff, so git adds no review value, only copies
- **no info is lost.** versions *"preserve, retrieve, and restore every version of every object"* [1], and no principal holds a delete verb

## .the one-way door, piece by piece

| piece | what aws does | source |
|---|---|---|
| **no overwrite** | with `If-None-Match: *`, s3 uploads *"only if the object key name does not already exist… Otherwise, Amazon S3 returns a 412 Precondition Failed error"* | [3] |
| **the header is mandatory** | a bucket policy may key on `s3:if-none-match`; aws's own example allows a put only under `"Null": {"s3:if-none-match": "false"}`. the vault denies a put where it is absent | [4] |
| **no public path** | block public access, at bucket and account level | [5] |
| **acls off** | object ownership *bucket owner enforced*: *"we recommend that you keep ACLs disabled"*, so policy alone decides access | [6] |
| **a key per tier** | sse-kms: to put, *"you need kms:GenerateDataKey permissions"*; to read, *"you need kms:Decrypt permissions"*. a reader with no decrypt on the `conftier.0` key cannot open a `conftier.0` record, whatever its s3 grant | [7] |
| **the right key, enforced** | *"To require that a particular AWS KMS key be used"*, the policy keys on `s3:x-amz-server-side-encryption-aws-kms-key-id` | [7] |
| **reads need mfa** | `aws:MultiFactorAuthPresent`; *"Long-term credentials, such as access keys, do not include this key"*, so a leaked access key reads naught | [8] |
| **the writer proves its bytes, blind** | `--checksum-sha256`; s3 *"independently calculates a checksum value… and validates"* it on put, so a writer with no read verb still knows the record landed intact | [9], [3] |
| **no delete, ever** | the policy denies `DeleteObject*` to all; object lock adds a retention floor. in compliance mode a locked version *"can't be overwritten or deleted by any user, including the root user"* | [10] |
| **every read is on record** | cloudtrail data events. *"By default, CloudTrail doesn't log data events"*, so the vault declares a trail that does | [11] |

## .the declaration

the vault is a declastruct wish in the client's infrastructure repo. every name below is a `declastruct-aws` type.

```ts
// the bucket: private, versioned, kept forever
const vault = DeclaredAwsS3Bucket.as({
  name: asOrgBucketName({ purpose: 'records-vault', env: 'prod' }),
  access: { public: 'blocked' },
  lifecycle: {
    objects: { expire: null, transitions: [] },
    versions: { status: 'enabled', expire: null },
    multiparts: { expire: { days: 7 } },
  },
  tags: null,
});
const vaultRef = RefByUnique.as<typeof DeclaredAwsS3Bucket>({ name: vault.name });
const vaultArns = { bucket: `arn:aws:s3:::${vault.name}`, objects: `arn:aws:s3:::${vault.name}/*` };

// a key per tier; the bucket default is conftier.1's
const vaultKeyConftier0 = DeclaredAwsKmsKey.as({
  alias: 'alias/records-vault-conftier-0',
  description: 'decrypts conftier.0 only',
  policy: vaultKeyPolicy({ readers: ['records-vault-reader-conftier-0'] }),
  rotation: 'enabled',
  tags: null,
});
const vaultKeyConftier1 = DeclaredAwsKmsKey.as({
  alias: 'alias/records-vault-conftier-1',
  description: 'decrypts conftier.1',
  policy: vaultKeyPolicy({ readers: ['records-vault-reader-conftier-0', 'records-vault-reader-conftier-1'] }),
  rotation: 'enabled',
  tags: null,
});
const vaultEncryption = DeclaredAwsS3BucketEncryption.as({
  bucket: vaultRef,
  algorithm: 'aws:kms',
  key: RefByUnique.as<typeof DeclaredAwsKmsKey>({ alias: vaultKeyConftier1.alias }),
  bucketKey: true,
});

// the retention floor; the period is the client's, with their cpa
const vaultLock = DeclaredAwsS3BucketObjectLock.as({
  bucket: vaultRef,
  mode: 'GOVERNANCE',
  retention: { years: 7 },
});

// the door
const vaultPolicy = DeclaredAwsS3BucketPolicy.as({
  bucket: vaultRef,
  document: {
    statements: [
      { sid: 'DenyPutWithoutIfNoneMatch', effect: 'Deny', principal: '*',
        action: ['s3:PutObject'], resource: [vaultArns.objects],
        condition: { Null: { 's3:if-none-match': 'true' } } },
      { sid: 'DenyConftier0PutOnAnotherKey', effect: 'Deny', principal: '*',
        action: ['s3:PutObject'], resource: [`arn:aws:s3:::${vault.name}/conftier.0/*`],
        condition: { StringNotEquals: { 's3:x-amz-server-side-encryption-aws-kms-key-id': vaultKeyConftier0Arn } } },
      { sid: 'DenyGetWithoutMfa', effect: 'Deny', principal: '*',
        action: ['s3:GetObject', 's3:GetObjectVersion'], resource: [vaultArns.objects],
        condition: { Null: { 'aws:MultiFactorAuthPresent': 'true' } } },
      { sid: 'DenyGetWithMfaFalse', effect: 'Deny', principal: '*',
        action: ['s3:GetObject', 's3:GetObjectVersion'], resource: [vaultArns.objects],
        condition: { Bool: { 'aws:MultiFactorAuthPresent': 'false' } } },
      { sid: 'DenyDeleteToAll', effect: 'Deny', principal: '*',
        action: ['s3:DeleteObject', 's3:DeleteObjectVersion'], resource: [vaultArns.objects] },
    ],
  },
});

// the writer: put only
const vaultWriterGrant = DeclaredAwsIamRolePolicyAttachedInline.as({
  name: 'records-vault-write',
  role: RefByUnique.as<typeof DeclaredAwsIamRole>({ name: 'records-vault-writer' }),
  document: {
    statements: [
      { sid: 'AllowPutNewRecords', effect: 'Allow', action: ['s3:PutObject'],
        resource: [`arn:aws:s3:::${vault.name}/conftier.0/*`, `arn:aws:s3:::${vault.name}/conftier.1/*`] },
      { sid: 'AllowEncryptOnPut', effect: 'Allow', action: ['kms:GenerateDataKey'],
        resource: [vaultKeyConftier0Arn, vaultKeyConftier1Arn] },
    ],
  },
});

// each reader: get + list + decrypt on its tiers; its role trust requires mfa
const vaultReaderConftier1Grant = DeclaredAwsIamRolePolicyAttachedInline.as({
  name: 'records-vault-read-conftier-1',
  role: RefByUnique.as<typeof DeclaredAwsIamRole>({ name: 'records-vault-reader-conftier-1' }),
  document: {
    statements: [
      { sid: 'AllowReadConftier1', effect: 'Allow', action: ['s3:GetObject', 's3:GetObjectVersion'],
        resource: [`arn:aws:s3:::${vault.name}/conftier.1/*`] },
      { sid: 'AllowListVault', effect: 'Allow', action: ['s3:ListBucket'], resource: [vaultArns.bucket] },
      { sid: 'AllowDecryptConftier1', effect: 'Allow', action: ['kms:Decrypt'], resource: [vaultKeyConftier1Arn] },
    ],
  },
});
// records-vault-reader-conftier-0: the same, on `${vault}/*` and both keys

// every read, on record
const vaultTrail = DeclaredAwsCloudTrailTrail.as({
  name: 'records-vault-reads',
  bucket: RefByUnique.as<typeof DeclaredAwsS3Bucket>({ name: vaultLogs.name }),
  multiRegion: true,
  events: {
    management: true,
    data: [{ resourceType: 'AWS::S3::Object', resources: [`arn:aws:s3:::${vault.name}/`] }],
  },
  tags: null,
});
```

- `vaultLogs` is a second private bucket whose own policy lets `cloudtrail.amazonaws.com` write
- `asOrgBucketName` stands for the client's bucket-name shape. s3 names are global, so a name carries an org namespace
- 🔴 **single-part puts only.** `DenyPutWithoutIfNoneMatch` also refuses `UploadPart`, which carries no `If-None-Match`. aws exempts multipart parts through `s3:ObjectCreationOperation` [4]; the vault leaves that out on purpose, as records are small and one fewer statement is one fewer to get wrong

## .the apply needs admin, so it runs local

the apply creates keys, roles, a bucket policy, and a trail. that takes the client's admin credentials, and those never reach a cloud machine. **plan, apply, and proof run on the client's own machine**, with its admin keyrack. the wish itself may be written anywhere.

## .how a record goes in

one put per record, as the writer:

```sh
sha=$(openssl dgst -sha256 -binary "$file" | base64)
aws s3api put-object \
  --bucket "$vault" --key "conftier.1/$path" --body "$file" \
  --if-none-match '*' --checksum-sha256 "$sha" \
  --server-side-encryption aws:kms
# conftier.0: --key "conftier.0/$path" --ssekms-key-id "$conftier0KeyArn"
```

| response | means | do |
|---|---|---|
| 200 | landed, bytes validated | append its manifest row |
| 412 | the key already holds a record | naught. never re-put under a new name to dodge it; read the extant one as a reader and compare shas |
| 409 | a concurrent request raced it [2] | retry once |
| 403 | the door refused: no `If-None-Match`, or the wrong key for `conftier.0` | fix the call; never widen the grant |

then, in the client's repo, the manifest gains one row:

```
| path | sha256 | bytes | date | conftier |
```

the repo commits the row, never the file. the source copy is deleted only after the row is committed and a reader has fetched the record back and matched its sha.

## .how a record comes out

a named human assumes a reader role with mfa, gets the object, and checks its sha against the manifest row. the trail records the read.

## .how to prove the vault

after the first apply, every row must hold, as the role named:

| as | do | expect |
|---|---|---|
| writer | put a new `conftier.1/` key, with the header and a checksum | 200 |
| writer | the same key again | 412 |
| writer | a new key, no header | 403 |
| writer | get, list, delete | 403 each |
| conftier.1 reader, no mfa | get a `conftier.1` record | 403 |
| conftier.1 reader, mfa | get a `conftier.1` record | 200, sha matches |
| conftier.1 reader, mfa | get a `conftier.0` record | 403 |
| any | delete a record | 403 |
| — | the trail | names each get above, by principal |
| — | plan after apply | no drift |

## .enforcement

- a `conftier.0` or `conftier.1` file committed to a repo = **blocker**
- a vault grant with a delete verb, or a writer with a read verb = **blocker**
- a put without `If-None-Match: *` that the policy would admit = **blocker**
- a source deleted before its manifest row is committed and its sha read back = **blocker**
- a vault apply run on a cloud machine with admin credentials = **blocker**

## .date researched

2026-11-20

## .publishability

☀️ **fullsun** (share). a generic recommendation; it names no client and no account.

## .see also

- `define.conftier` — the tiers this vault holds
- `rule.require.client-facts-in-a-private-tree` — where `conftier.3` lives
- `whyto.client-facts-live-in-a-private-tree` — why a repo cannot hold the lower tiers

## .sources

1. [AWS — Retaining multiple versions of objects with S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html) — pulled 2026-11-20 via bhrowser, 5,805 chars
2. [AWS — How to prevent object overwrites with conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) — pulled 2026-11-20 via bhrowser, 9,354 chars
3. [AWS CLI — put-object (CLI 2.41.1 Command Reference)](https://docs.aws.amazon.com/cli/latest/reference/s3api/put-object.html) — pulled 2026-11-20 via bhrowser, 46,993 chars
4. [AWS — Enforce conditional writes on Amazon S3 buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes-enforce.html) — pulled 2026-11-20 via bhrowser, 9,675 chars
5. [AWS — Blocking public access to your Amazon S3 storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) — pulled 2026-11-20 via bhrowser, 23,160 chars
6. [AWS — Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html) — pulled 2026-11-20 via bhrowser, 13,759 chars
7. [AWS — Using server-side encryption with AWS KMS keys (SSE-KMS)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) — pulled 2026-11-20 via bhrowser, 17,858 chars
8. [AWS IAM — Secure API access with MFA](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_configure-api-require.html) — pulled 2026-11-20 via bhrowser, 19,751 chars
9. [AWS — Checking object integrity in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html) — pulled 2026-11-20 via bhrowser, 4,599 chars
10. [AWS — Locking objects with Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html) — pulled 2026-11-20 via bhrowser, 16,405 chars
11. [AWS — Amazon S3 CloudTrail events](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cloudtrail-logging-s3-info.html) — pulled 2026-11-20 via bhrowser, 14,398 chars
