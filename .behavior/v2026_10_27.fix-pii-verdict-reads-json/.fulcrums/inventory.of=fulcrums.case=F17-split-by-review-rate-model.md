# F17: split #54 by a per-kind review-rate model

## .the fork

the 30-min bar needs a minute estimate per layer pr. either (a) one flat rate per changed line, or (b) a rate per kind: prod 25, tests 70, snapshots 150, docs 250 lines/min, set so #54 sums to the ~105 min the director stated.

## .taken, why

(b). a flat rate would weigh 3023 lines of route docs like 864 lines of shell; that cut would split the docs and leave the brain logic in one oversized pr. per-kind rates put the weight where review time goes.

the two large files (`pii.scan.via.brain.sh`, its integration test) are apportioned by function and by test case span across L3a / L3b / L3c. those counts are estimates to ±10%.

## .rework

clean. the plan is a doc; no branch, commit, or caller rests on it. a re-measure at each layer's own tree replaces the estimate, and a layer over 30 min splits again by case span before it opens.

## .confidence: 75%, why low

the rates are calibrated to one total, not measured per kind. a reviewer who reads tests slower than 70/min pushes L3b (the test-heaviest) toward the bar.

## .where

`split-plan.md`, sections `.the review-time model` and `.the layers, in merge order`.

## .verdict

open; rides to the director with the plan.
