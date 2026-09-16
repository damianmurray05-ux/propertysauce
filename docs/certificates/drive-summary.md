# Drive certificate index – summary

Built 2026-09-16 from Google Drive (admin@propertysauce.co) and the Zoho CRM property list (150 properties). Outputs: `drive-certificates.json` (keyed by Zoho property id) and `drive-unmatched.csv`.

## Counts

- Files indexed: **618**
- Matched to a Zoho property: **581** (146 of 150 properties have at least one certificate)
- Unmatched: **37** (see drive-unmatched.csv)

| Type | Matched | Unmatched | Total |
|---|---:|---:|---:|
| gas | 46 | 5 | 51 |
| eicr | 269 | 9 | 278 |
| eic | 1 | 1 | 2 |
| electrical | 17 | 5 | 22 |
| epc | 212 | 13 | 225 |
| licence | 36 | 3 | 39 |
| fire | 0 | 1 | 1 |

`electrical` = the file name only says "electric/elect cert" so it cannot be told apart as EICR or EIC from the name (the earlier certificates-index.csv uses the same label). NICEIC-named files are also `electrical` unless the earlier index classified them.

## Folders indexed

- Certificates (1zN3_yQwyF8o4tER6yaUtoVOD3LYXlGo2): EPC - All Properties (117), EICR - All Properties (127), Landlord Licences - All Properties (16). **Gas CERTIFICATES - All Properties is empty** – gas certificates only exist in the per-property folders and the email archive.
- Electric certificates 1y1_ZYVy… (43, Catterick 2030 EICRs), 1ZyaOpgA… (9, Lord Street EICRs), 1LEp2wQd… (72 across Tanc / Michelle Murray / DM / Catterick / Other Landlord / M S / Beamount sub-folders).
- Certificates folder (1KyBYXU_t7QpI9-2AuekvQ2FQKjR329Dc): 7 landlord folders, 48 property folders, 42 Beaucatt EPCs, 19 files inside per-property "Landlord License" sub-folders. The "No gas", "Landlord License Applied/In Process", "Property is Not Rented" and similar sub-folders are all empty (status markers only).
- Claude / 05 Email Archive / Property Documents / _Unsorted: searched by name for gas, cp12, eicr, eic, niceic, electric(al), elec, epc, energy, licence/license, fire, cert; 48 certificate-like files kept. Skipped from that folder: invoices ("72 Kettelbaston Rd Gas cert invoice", "Call out- Bradley Electrician"), deposit certificates, driving-licence scans, Word templates ("Gas Cert.docx", "Gas Safe Engineer.docx"), a building-regulations compliance certificate for 47 Wilmot Road, "Fire Safety & Emergency Procedure" and the "Selective Licence communication" court exhibits.
- Every folder listed successfully; none failed.

## Properties with the most certificates

- 18 – 72 Kettlebaston Road, E10 7PF (gas 6, epc 4, licence 4, eicr 3, electrical 1)
- 11 – Flat 1, 96 Pearcroft Road - E11 4DR (gas 6, eicr 3, epc 2)
- 10 – 1 Onslow Close E4 6QD (gas 6, eicr 3, epc 1)
- 8 – GF 225 Church Road E10 7BQ (eicr 3, gas 3, licence 1, epc 1)
- 7 – 39 Palatine Road, Blackpool FY1 4BX (licence 3, eicr 2, epc 2)
- 7 – 50 Green Pond Close, E17 6EE (epc 2, eicr 2, licence 2, eic 1)
- 7 – 72C Kingswood Road, E11 1SF (eicr 3, licence 2, epc 1, gas 1)
- 7 – 72D Kingswood Road, E11 1SF (eicr 3, licence 2, epc 1, gas 1)
- 7 – Flat 37, Catterick House, Cottenham Road, S65 1LD (eicr 4, epc 3)
- 6 – 1 Lovinya Court Hillingdon Avenue Sevenoaks TN13 3QZ (eicr 2, electrical 2, epc 1, gas 1)
- 6 – 10 Tudor Court, E17 8ET (epc 2, eicr 2, licence 1, gas 1)
- 6 – 32D Hollybush Lodge E10 5JD (licence 2, electrical 2, epc 2)

## Properties with the fewest

No certificate file at all in Drive:

- 28a Kenilworth Gardens, IG10 3AF
- 4 High Street, Saffron Walden, Essex, CB10 1AY
- FF 55 Coopers Lane E10 5DG
- Windmill Cottage 1 - Richard Furlong

Only one or two files:

- 2 – Hawkesmead, CB10 2QS (electrical 1, epc 1)
- 2 – Windmill Cottage, CO9 3RL (epc 2)
- 1 – 102 New Road E4 9SY (electrical 1)
- 1 – 127 C Grange Park, Leyton, E10 5ET (electrical 1)
- 1 – Windmill Cottage Braintree Road Sible Hedingham CO9 3RL (eicr 1)
- every Lancaster House flat (44 flats) has exactly 2 files: one EICR and one EPC, no gas certificate and no licence

## Gas certificate coverage

Only **29** properties have a gas certificate in Drive. None of the Catterick House flats, Lancaster House flats or 35 Lord Street flats have one (Lord Street and several others have a "No gas" marker folder, so that is probably correct for them; Catterick and Lancaster are unknown). For the properties that do have gas certificates the history is thin: mostly one current certificate, except 72 Kettlebaston Road (7 gas files) and 1 Onslow Close (6) where the email archive holds older years.

## Duplicates

117 file names appear in more than one folder with an identical size (122 extra copies). The whole "Certificates" tree (EPC / EICR / Licences - All Properties) is a copy of the per-property folders in "Certificates folder" and the older "Electric certificates" folders; the Catterick 2030 EICRs and Lord Street EICRs exist in three places. All copies are kept in the JSON (each has its own driveId) so the portal can de-duplicate on name+size if it wants a single link.

Examples:

- EICR - Flat 1, 474 Lea Bridge Road. 7.9.26.pdf (3 copies: Certificates/EICR - All Properties / Certificates folder/Murray & Sullaivan/Flat 1, 474 Leabridge Road / Electric certificates (1LEp2wQd)/M S)
- Flat 4, 35 Lord street EPC.pdf (3 copies: Certificates/EPC - All Properties / Certificates folder/35 Lord Street/EPC / Claude/05 Email Archive/Property Documents/_Unsorted)
- Absolute London Limited - 72, Kettlebaston Road.  FINAL LICENCE.pdf (3 copies: Certificates/Landlord Licences - All Properties / Certificates folder/Other landlord/72 Kettlebaston Road/Landlord License / Claude/05 Email Archive/Property Documents/_Unsorted)
- EICR_ 1 Onslow Close. 6.9.26.pdf (3 copies: Certificates folder/Murray & Sullaivan/1 Onslow Close / Electric certificates (1LEp2wQd)/M S / Claude/05 Email Archive/Property Documents/_Unsorted)
- New Windmill Cottage elect cert (1).pdf (3 copies: Electric certificates (1LEp2wQd)/Beamount / Claude/05 Email Archive/Property Documents/_Unsorted)

## Dates

- 267 files carry a date in the file name (dateSource = filename). Note these are usually the **expiry / next-inspection date** the office typed in (e.g. "EICR 17-03-2030", "EPC 6.8.2031"), not the issue date.
- 322 files have no date in the name; the Drive modified date is used (dateSource = drive). For the two big bulk uploads (Feb 2026 and Sep 2026) that is the upload date, not the certificate date – all 42 "Energy performance certificate (EPC) – N Catterick" and all 42 "N Catterick EPC" files, all "N Lancaster House - EPC/EICR" files and most Beaucatt EICRs fall into this group.
- 29 email-archive files have no certificate date in the name; the email date prefix of the file name (e.g. 2024-02-11__gmail__…) is used and recorded as dateSource = filename.
- Year-only names get 1 January of that year: "2, confield EICR 2030.jpg", "10 Tudor Court, Gar Cert - E17 8ET, 2026.pdf", "Gas cert for 8 Karen Terrace, E11, 2026.pdf", "Gas cert for Flat 1, 253 Leabridge Road E10, 2026.pdf", "First Floor, 225 Church Road E10 Gas Cert, 2026 (1).pdf", "Gas cert for 18 Wall End E6 2NW, 2026.pdf", "Gas cert for 1 Onslaw Close E4 6QD, 2024 (1).pdf". "15 HeathCote Grove EICR Aug 2028" gets 2028-08-01.

## Matches that relied on more than the file name

These are confident but were not decided by the address in the name alone:

- 101 Fortitude Properties Licence 15 Aug 2028.pdf → 32D Hollybush Lodge E10 5JD — existing certificates-index.csv
- 225a Church Road  Landlord Licence - WAL-454375303096 - 24 Apr 2030.pdf → GF 225 Church Road E10 7BQ — folder (GF 225 Church Rd); name says 225a
- 225 Church Property License.png → FF 225 Church Road E10 7BQ — folder (FF 225B Church Rd); name has no floor
- Energy performance certificate (EPC) – 25-6-2034.PDF → 50 Green Pond Close, E17 6EE — folder (50 Green Pond); no address in name, same size as '50, Green pond (EPC) – 25-6-2034.PDF'
- EPC 255 gf church rd 10.05.2026 (1).pdf → GF 225 Church Road E10 7BQ — folder (GF 225 Church Rd); name has typo 255
- Gas cert for Flat 1, 464 Lea Bridge Road, E10 7DU, 20march2026.pdf → F1 474 Lea Bridge Road E10 7DU — name (postcode E10 7DU; house number mistyped 464)
- EPC - Annex 1.pdf → The Annexe, Windmill Cottage, Braintree Road, Sible Hedingham, CO9 3RL — folder (Annex Windmill Cottage) + Annex 1 in name
- EICR - Annex 2 Windmil Cottage 14-04-2029.pdf → The Annexe, Joan Elaine Cottage, Braintree Road, Sible Hedingham CO9 3RL — folder (Annex Joan Elain Cottage); name says Annex 2 Windmill Cottage
- EPC - Annex 2.pdf → The Annexe, Joan Elaine Cottage, Braintree Road, Sible Hedingham CO9 3RL — folder (Annex Joan Elain Cottage) + Annex 2 in name
- windmil cotage EICR 16-10-2030 Leo.pdf → Windmill Cottage Braintree Road Sible Hedingham CO9 3RL — existing certificates-index.csv
- Windmill EPC.pdf → Windmill Cottage, CO9 3RL — existing certificates-index.csv
- Jaunary houe EICR 14-4-2030.pdf → 6 January House, 28 Birdhurst Rise, CR2 7ED — existing certificates-index.csv
- GRANGE PARK RD ELECT CERT .pdf → 127 C Grange Park, Leyton, E10 5ET — folder (Tanc - Property) + street in name (no house number)
- 35-Catterick House-EICR.pdf → Flat 35, Catterick House, Cottenham Road, S65 1LD — existing certificates-index.csv
- Flat 34 EICR - Expiry Date is wrong.pdf → Flat 34, Catterick House, Cottenham Road, S65 1LD — folder (Catterick) + flat number in name
- 18-Catteric Houe-EICR.pdf → Flat 18, Catterick House, Cottenham Road, S65 1LD — existing certificates-index.csv
- Flat 12, EICR - Expiry Date is wrong.pdf → Flat 12, Catterick House, Cottenham Road, S65 1LD — folder (Catterick) + flat number in name
- 11- Catteric House -EICR.pdf → Flat 11, Catterick House, Cottenham Road, S65 1LD — existing certificates-index.csv
- 2023-05-22__propertysauce-co__Windmill EPC (2).pdf → Windmill Cottage, CO9 3RL — existing certificates-index.csv (same file name without archive prefix / copy suffix)

## Anything odd

- **Windmill Cottage** has three Zoho records (216 "Windmill Cottage, CO9 3RL", 348 "Windmill Cottage Braintree Road…", 352 "Windmill Cottage 1 - Richard Furlong") plus the annexe. The earlier index put "Windmill EPC.pdf" under 216 and "windmil cotage EICR 16-10-2030 Leo.pdf" under 348; those were reused. "New Windmill Cottage elect cert (1).pdf" (3 copies) is left unmatched because nothing in the name says which record. Merging the three records in Zoho would fix this.
- **225 Church Road**: the file "225a Church Road Landlord Licence - WAL-454375303096 - 24 Apr 2030.pdf" sits in the GF 225 Church Rd folder and the FF folder is named "FF 225B", so 225a = ground floor and it is indexed under GF 225. The earlier certificates-index.csv had it under FF 225 – that looks wrong, but there is also a separate "Landlord Licences - FF 225 Church Road - 24 Apr 2030.pdf" (different size) that is indexed under FF 225.
- **39 Palatine Road licences**: "Landlrod Licence - 39 Palatine.PDF", "39 Palatine - Landlord Licence.PDF", "Landlord Licence - 31 Mar 2030.PDF" and the email attachment "39 Palatine Road - Propose to licence - Applicant.PDF" are all the same size (657,760 bytes) – so the "licence" on file is Blackpool's *proposal* to licence, not the granted licence. "Landlord Licence - 31 Mar 2030.PDF" has no address and the earlier index put it under Flat 1, 35 Lord Street; it is left unmatched.
- "101 Fortitude Properties Licence 15 Aug 2028.pdf" names the owner not the address; it is the same file as "32d Hollybush Landlord License.pdf" and is indexed under 32D Hollybush Lodge (reused from the earlier index).
- "Red Top Properties (Yusuf Loonat) - 72, Kettlebaston Road… DRAFT LICENCE.pdf" is a draft, and the file name says the licence holder is Red Top Properties / Absolute London Limited, not Yusuf Loonat directly.
- "Flat 34 EICR - Expiry Date is wrong.pdf" and "Flat 12, EICR - Expiry Date is wrong.pdf" (Catterick) are flagged by the office as having a wrong expiry date.
- "26 KENILWORTH GARDENS. Electric Cert 16.03.2024 - Same serial number on every certificate.pdf" – the office notes the electrician re-used one serial number.
- "EICR - Annex 2 Windmil Cottage 14-04-2029.pdf" is filed under Annex Joan Elaine Cottage; the two annexes appear to be Annex 1 (Windmill) and Annex 2 (Joan Elaine).
- Three certificates are photos, not PDFs: "2, confield EICR 2030.jpg", "72, kettel EICR 1-7-2030.jpg", "15 fulready rd - Gas Cert - 2-11-26.jpg" (plus two Onslow Close gas-cert JPEGs and "225 Church Property License.png" in the email archive).
- "EICR - Catt Hallway 17-03-2030.pdf" is the communal-area EICR for Catterick House; it belongs to the block, not a flat, so it is unmatched (the earlier index used a "Catterick House Main" Zoho record that is not in this landlord's property list).
- Lancaster House files exist for 3A, 4A, 5A and 32C but Zoho has no such flats (it has 2a, 6a, 26a, 32a, 32b). 8 files unmatched.
- 8 Karen Terrace, 3 Stourhead Gardens, 47 Wilmot Road and 25 Powell Court have certificates in Drive but are not in the Zoho property list (16 files unmatched).
- The earlier certificates-index.csv lists 2013–2018 email attachments (6 Mount Avenue, 24 Kenilworth Gardens, 25 Elm Park, 7 Kestrel Road, 74C Kingswood…) that no longer exist anywhere in Drive – they were not in _Unsorted and a Drive-wide name search finds nothing.
- "10 Tudor Court" has no reference number in Zoho (id 2406742000001876907).
