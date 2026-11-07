# Historical 2023 XML benchmark — not live data

Captured 7 November 2026 from the Electoral Commission's official archive:
https://archive.electionresults.govt.nz/electionresults_2023/xml/

The directory itself returns 403, but named files are available. The six files are unchanged captures: election.xml, statistics.xml, parties.xml, electorates.xml, candidates.xml and e01/e01.xml (saved as e01.xml). Source owner: Electoral Commission New Zealand. SHA-256 hashes are recorded in sha256.json. These are test fixtures; they are never bundled into the browser or served by the live API.

published-summary.json is an independent transcription by table extraction from the official archive HTML at https://archive.electionresults.govt.nz/electionresults_2023/ . It records the published general-election snapshot: 122 seats, including National 48 and Te Pāti Māori 6. Do not interpret it as a later Parliament composition after subsequent elections or changes.

The XML is historical, not a clean election-night sequence. election.xml has a 2024-11-10 timestamp and statistics.xml a 2024-05-02 timestamp. Metadata declares 20 registered parties but provides 17 party-vote rows; the published HTML also has umbrella/constituent-party rows. The XML name Freedoms NZ (Umbrella party) maps explicitly to the published Freedoms NZ aggregate. Counted voting places (10,655) exceed the inventory of voting places (3,083), so the live adapter’s reporting-denominator assumption cannot be applied unchanged. The directory has 72 electorates while the published summary allocates 71 electorate seats. These historical schema/coverage differences are explicitly tested, not corrected or relabelled as 2026 data. Archive access alone does not establish completeness of an election-night replay or feed reuse permission for publication.
