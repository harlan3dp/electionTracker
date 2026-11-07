# Counting-feed regression capture

Unchanged public XML retrieved over HTTPS from https://media.election.net.nz/xml/ on 7 November 2026, approximately 19:08 NZDT. `election.xml` has source timestamp 19:07:44; `statistics.xml` supplies 2,683 unique voting places but 9,387 voting-place results. The count is 101 / 9,387, displayed by the source as 1.1%. Using unique places as the denominator incorrectly rejected the feed.

Tests combine these two captures with the existing `official-feed` directories, whose IDs and inventory counts match. Source-supplied list/electorate/total seat fields are provisional calculations, not declarations of elected candidates. These captures are regression inputs only and are not shipped as live results or treated as independent verification of election/test identity or permission. The existing publication guard remains required.
