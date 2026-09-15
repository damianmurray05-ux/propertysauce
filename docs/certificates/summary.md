# Certificate index summary

Generated 2026-09-15 from 1122 candidate documents: 967 Zoho CRM attachments and 155 files from the Drive email archive, covering 162 live properties (Archived and Sold records skipped).

## Counts

- Documents by type: gas 291, EPC 275, EICR 264, licence 163, EIC 70, electrical 56, other 3
- Documents by confidence: low 840, high 199, medium 83
- Documents with a key date extracted from a text layer: 314
- Documents with no text layer (scanned): 723. For these the date column is left blank; where OCR could read a typed date it is recorded in the notes as unverified (365 documents). Handwritten Gas Safe forms mostly do not OCR reliably.
- Zoho image attachments (jpg/png) listed but not downloaded: 65
- Drive files that could not be matched to a live property: 118 (of which 0 ambiguous). Most are old certificates for properties no longer managed.
- Address mismatches or filename/content conflicts flagged: 1
- Building-level documents attached to individual flats (address not unit-specific): 65
- Electrical Installation Certificates (EIC, new work, not a condition report): 70; draft licences: 10; files that turned out not to be certificates (invoices etc): 3
- Live properties with no candidate document in either source: 5
- Proposed Zoho corrections (zoho-updates.csv): 35

## How dates were read

- Gas: the 'next safety check due' date. EICR: the 'retest' or 'next inspection' date, or inspection date plus the recommended interval (default five years). EPC: 'valid until', or date of certificate plus ten years minus one day for the old layout. Licence: the 'expiry date'.
- The date in the file name (email date or a date typed into the name) is recorded separately and never used as the document date.
- Confidence high = text layer, date found, and the address printed in the document matches the property. Medium = date found but the printed address could not be confirmed against the property, or the property was identified from the document rather than the file name. Low = scanned, no date, draft, invoice, or an address conflict.
- Zoho appears to store expiry dates as the day before the anniversary (for example EICR retest 25/03/2031 held as 2031-03-24). Old-layout EPCs are treated as date of certificate plus ten years minus one day, which is what the gov.uk register prints. Remaining one-day differences are listed in zoho-updates.csv with confidence low and can be ignored.
- zoho-updates.csv only uses high-confidence documents. Rows marked medium there are cases where Zoho already holds a later date than any document found, so a newer certificate probably exists that is not in either archive; check before changing anything.

## Ten most urgent findings (expired or expiring within 60 days, per the documents)

- 3 Radley Court, 144 Selhurst Rd, London SE25 6LP: licence 2020-09-30 (expired 2176 days ago); Zoho holds 2020-09-30. Source zoho: 3 Radley court property license.pdf
- 28a Kenilworth Gardens, IG10 3AF: EPC 2020-11-10 (expired 2135 days ago); Zoho holds 2020-11-10. Source zoho: 28, Kenilworth Gardens - EPC.pdf
- Flat C, Hollybush Lodge, 32 Grange Rd, E10 5JD: licence 2025-03-23 (expired 541 days ago); Zoho holds blank. Source zoho: 32c Hollbysh Landlord License.pdf
- Flat 1, Catterick House, Cottenham Road, S65 1LD: licence 2025-04-30 (expired 503 days ago); Zoho holds 2025-04-30. Source zoho: Catterick License.html
- 39 flats at Catterick House, Cottenham Road, S65 1LD: licence 2025-04-30 (expired 503 days ago); Zoho holds 2025-04-30. Source zoho: Catterick Property License Exp 2025.html
- 127 C Grange Park, Leyton, E10 5ET: licence 2025-11-08 (expired 311 days ago); Zoho holds 2025-10-08. Source zoho: 127C Grange Road License.pdf
- Flat 1, 253 Lea Bridge Road, E10 7NE: licence 2026-02-21 (expired 206 days ago); Zoho holds 2020-03-31. Source zoho: Selective License Flat1, 253 Lea Bridge Road.pdf
- Flat 3, 253 Lea Bridge Road, E10 7NE: licence 2026-03-23 (expired 176 days ago); Zoho holds 2020-03-31. Source zoho: F3 253 Lea Bridge License.pdf
- 122 Morley Road, E10 6LL: licence 2026-05-03 (expired 135 days ago); Zoho holds 2026-05-03. Source zoho: 122 Morley License.pdf
- F1 474 Lea Bridge Road E10 7DU: licence 2026-09-30 (expires in 15 days); Zoho holds 2026-09-30. Source zoho: F1 474 Lea Bridge license.pdf

A further 24 documents are expired or expiring but Zoho already holds a later date for that certificate, so a newer certificate probably exists that is not in either archive. They are listed in certificates-index.csv and, where the document was high confidence, in zoho-updates.csv as medium.

## Anything odd

- 51 electrical certificates (mostly the Catterick House EICs from 2019 and several NICEIC installation certificates) have a text layer that is only the blank NICEIC form with sample data (client Errol Hewitt, 15 Yorkshire Close, dated 25/10/2018); the real certificate is an image on top. They were treated as scanned and OCR was used for the notes only.
- Address problem: The Annexe, Joan Elaine Cottage, Braintree Road, Sible Hedingham CO9 3RL | EPC | 2034-04-18 | zoho: EPC - Annex 2.pdf. Note: ADDRESS MISMATCH: document is for Windmill Cottage 2
- Draft licence, no expiry: 122 Morley Road, E10 6LL | licence | no date | zoho: 122 Morley Rd License.pdf
- Draft licence, no expiry: 3 Radley Court, 144 Selhurst Rd, London SE25 6LP | licence | no date | zoho: Radley Property License .pdf
- Draft licence, no expiry: 50c North Birkbeck, E11 4JG | licence | no date | zoho: 50c North Birkbeck - Draft Licence.pdf
- Draft licence, no expiry: 664B High Road E10 6JP | licence | no date | zoho: 664b Licence.pdf
- Draft licence, no expiry: 72 Kettlebaston Road, E10 7PF | licence | no date | drive: 2025-08-22__vicaragecourt__Red Top Properties (Yusuf Loonat) - 72, Kettlebaston Road, London, E10 7PF.  DRAFT LICENCE.pdf
- Draft licence, no expiry: 72 Kettlebaston Road, E10 7PF | licence | no date | zoho: 72, Kettlebaston Road, London, E10 7PF.  DRAFT LICENCE.pdf
- Draft licence, no expiry: 72C Kingswood Road, E11 1SF | licence | no date | zoho: 72C Kingswood License.pdf
- Draft licence, no expiry: FF 55 Coopers Lane E10 5DG | licence | no date | zoho: FF 55 Coopers property license.pdf
- Draft licence, no expiry: Flat C, Hollybush Lodge, 32 Grange Rd, E10 5JD | licence | no date | zoho: 32C Hollybush property license .pdf
- Draft licence, no expiry: GF 55 Coopers Lane E10 5DG | licence | no date | zoho: GF 55 Coopers license.pdf
- OCR-only dates that differ from Zoho (scanned documents, verify by eye before changing anything): 207
  - 1 Lancaster House, Browrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-04-22 | Zoho 2031-04-21 | zoho: EICR - 1 Lancaster House.pdf
  - 1 Lovinya Court Hillingdon Avenue Sevenoaks TN13 3QZ | gas | OCR reads 2021-05-20 | Zoho 2026-12-16 | zoho: hillingdon gas certificate.pdf
  - 1 Onslow Close E4 6QD | EICR | OCR reads 2031-08-29 | Zoho 2031-08-28 | zoho: 1 onslow close EICR - 28-8-31.pdf
  - 1 Onslow Close E4 6QD | EICR | OCR reads 2028-09-06 | Zoho 2031-08-28 | drive: 2024-06-04__propertysauce-co__EICR_ 1 Onslow Close. 6.9.26 (1).pdf
  - 1 Onslow Close E4 6QD | EICR | OCR reads 2028-09-06 | Zoho 2031-08-28 | zoho: EICR_ 1 Onslow Close. 6.9.26.pdf
  - 1 Valley Side Parade E4 8AJ | EPC | OCR reads 2020-03-16 | Zoho 2030-03-13 | zoho: EPC 1 valley.pdf
  - 1 Valley Side Parade E4 8AJ | gas | OCR reads 2019-07-19 | Zoho 2026-11-24 | zoho: 1 Valley Gas certificate.pdf
  - 10 Claremont Road, E17 5RJ | licence | OCR reads 2020-03-31 | Zoho 2030-01-21 | zoho: PROPERTY LICENCE 10 CLAREMONT ROAD 31.03.2020.pdf
  - 10 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-05-16 | Zoho 2031-05-15 | zoho: Flat 10 Lancaster - EICR_Ref22075651_compressed.pdf
  - 10 Tudor Court, E17 8ET | EPC | OCR reads 2021-09-19 | Zoho 2031-09-06 | zoho: 10 Tudor Court EPC.pdf
  - 10 Tudor Court, E17 8ET | licence | OCR reads 2025-03-23 | Zoho 2031-06-29 | zoho: 10 Tudor Court property licence.pdf
  - 102 New Road E4 9SY | EPC | OCR reads 2020-03-18 | Zoho 2030-04-07 | zoho: 102 EPC.pdf
  - 102 New Road E4 9SY | gas | OCR reads 2022-10-05 | Zoho 2026-11-01 | zoho: Gas Safe 2021 - 102 New Rd.pdf
  - 12 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-05-16 | Zoho 2031-05-15 | zoho: Flat 12 Lancaster - EICR_Ref2675805.pdf
  - 125 Kitchener Road, E17 4LJ | EPC | OCR reads 2028-01-24 | Zoho 2028-01-25 | zoho: 125 Kitchener Rd EPC.pdf
  - 125 Kitchener Road, E17 4LJ | gas | OCR reads 2019-01-23 | Zoho 2026-11-11 | zoho: 125 Kitchener Rd Gas Certificate.pdf
  - 125 Kitchener Road, E17 4LJ | licence | OCR reads 2020-03-31 | Zoho 2030-01-21 | zoho: 125 Kitchener property licence.pdf
  - 13 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-05-16 | Zoho 2031-05-15 | zoho: Flat 13 Lancaster - EICR_Ref91619803.pdf
  - 14 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-05-16 | Zoho 2031-05-15 | zoho: Flat 14 Lancaster -EICR_Ref7982419_compressed.pdf
  - 15 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-05-16 | Zoho 2031-05-15 | zoho: EICR - Flat 15 Lancaster.pdf
  - 16 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-04-30 | Zoho 2031-04-29 | zoho: EICR - 16 Lancaster.pdf
  - 17 Lancaster House, Brownrigg Dr, Cramlington NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 17 Lancaster EICR.pdf
  - 18 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 18 Lancaster EICR.pdf
  - 18 Wall End Court, E6 2NW | EICR | OCR reads 2023-09-07 | Zoho 2029-10-01 | zoho: 18 Wall End Court Electric Certificate 6.9.2025.pdf
  - 19 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 19 Lancaster EICR.pdf
  - 1A Lancaster House, Browrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-07-02 | Zoho 2031-07-01 | zoho: EICR - 1a Lancaster.pdf
  - 2 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-04-22 | Zoho 2031-04-21 | zoho: EICR - 2 Lancaster House.pdf
  - 20 Lancaster House, Brownrigg Dr, Cramlington NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 20 Lancaster EICR.pdf
  - 21 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 21 Lancaster EICR.pdf
  - 22 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 22 Lancaster EICR.pdf
  - 23 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 23 Lancaster EICR.pdf
  - 24 Lancaster House, Brownrigg Drive, Cramlington NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 24 Lancaster EICR.pdf
  - 26 Kenilworth Gardens, IG10 3AF | EPC | OCR reads 2023-05-02 | Zoho 2033-05-15 | zoho: 26 Kenilworth EPC 2.05.2023 (1).pdf
  - 26 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: Flat 26 Lancaster - EICR.pdf
  - 26a Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: 26a Lancaster EICR.pdf
  - 27 Lancaster House, Brownrigg Drive, Cramlington NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: EICR - 27 Lancaster.pdf
  - 28 Lancaster House, Brownrigg Dr, Cramlington NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: EICR - 28 Lancester house.pdf
  - 29 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: EICR - 29 Lancester house.pdf
  - 3 Lancaster House, Browrigg Drive, Cramlington, NE23 6UN | EICR | OCR reads 2031-04-22 | Zoho 2031-04-21 | zoho: EICR - 3 Lancaster House.pdf
  - 30 Lancaster House, Brownrigg Drive, Cramlington NE23 6UN | EICR | OCR reads 2031-03-25 | Zoho 2031-03-24 | zoho: EICR - 30 Lancester house.pdf
  - ...and 167 more in certificates-index.csv (search notes for 'OCR (unverified)').
- Properties with no certificate document found anywhere: 25 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN; 25a Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN; 2a Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN; Catterick; Sure Lets and Manage Limted

## Proposed Zoho corrections

- 1 Lovinya Court Hillingdon Avenue Sevenoaks TN13 3QZ: Gas_Safe_Certificate 2026-12-16 -> 2023-07-01 (medium; zoho: 1 Lovinya Court gas certificate, 4.7.23.pdf)
- 1 Onslow Close E4 6QD: Gas_Safe_Certificate 2026-11-05 -> 2024-01-10 (medium; zoho: 1 Onslow Close Gas cert. 10.1.24.pdf)
- 1 Valley Side Parade E4 8AJ: Gas_Safe_Certificate 2026-11-24 -> 2023-07-04 (medium; zoho: 1 Velly Side Prade gas  certificate, 4.7.23.pdf)
- 10 Claremont Road, E17 5RJ: Gas_Safe_Certificate 2026-10-02 -> 2024-01-10 (medium; zoho: 10 Claremont Road Gas cert. 10.1.24.pdf)
- 125 Kitchener Road, E17 4LJ: Gas_Safe_Certificate 2026-11-11 -> 2023-11-18 (medium; zoho: 125 Kitchener Road Gas cert, 18.11.23.pdf)
- 127 C Grange Park, Leyton, E10 5ET: Landlords_Property_License 2025-10-08 -> 2025-11-08 (high; zoho: 127C Grange Road License.pdf)
- 15 Heathcote Grove, E4 6RZ: Gas_Safe_Certificate 2026-10-06 -> 2023-07-04 (medium; zoho: 15 Heathcote Grove gas certificate, 4.7.23.pdf)
- 26 Kenilworth Gardens, IG10 3AF: Gas_Safe_Certificate 2026-10-01 -> 2023-09-02 (medium; zoho: 26 Kenilworth Garden Gas cerificate, 2.9.23.pdf)
- 3 Radley Court, 144 Selhurst Rd, London SE25 6LP: Gas_Safe_Certificate 2026-10-03 -> 2024-01-09 (medium; zoho: Radley Court Gas certificate. 9.1.23.pdf)
- 32D Hollybush Lodge E10 5JD: Landlords_Property_License 2028-08-16 -> 2028-08-15 (low; zoho: 101 Fortitude Properties Licence 15 Aug 2028.pdf)
- 37 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN: EPC_Expiry 2036-04-11 -> 2036-04-12 (low; zoho: EPC - 37 Lancaster.pdf)
- 4 High Street, Saffron Walden, Essex, CB10 1AY: EPC_Expiry 2032-05-25 -> 2032-05-26 (low; zoho: EPC Energy performance certificate 4 High St.pdf)
- 44 Lancaster House, Brownrigg Drive, Cramlington, NE23 6UN: EPC_Expiry 2036-04-11 -> 2036-04-12 (low; zoho: EPC - 44 Lancaster.pdf)
- 45a Seaview Road, Shoeburyness, SS3 9DX: Gas_Safe_Certificate 2027-07-15 -> 2023-07-04 (medium; zoho: 45a Sea View Road gas certificate, 4.7.23.pdf)
- 52b Beedell Avenue, Southend-on-Sea, SS0 9JS: Gas_Safe_Certificate 2027-05-25 -> 2024-03-28 (medium; zoho: Gas Cert - 52B Bedell Avenue.28.3.24.pdf)
- 6 January House, 28 Birdhurst Rise, CR2 7ED: Gas_Safe_Certificate 2026-11-25 -> 2023-11-01 (medium; zoho: Flat 6 Jnauary House gas cert. 1.11.23.pdf)
- 72 Kettlebaston Road, E10 7PF: EPC_Expiry 2028-03-01 -> 2028-02-29 (low; drive: 2024-02-11__gmail__EPC - 72 kettlebaston.pdf)
- 72C Kingswood Road, E11 1SF: Gas_Safe_Certificate 2026-11-01 -> 2023-11-18 (medium; zoho: 72C Kingswood Gas cert, 18.11.23.pdf)
- 72C Kingswood Road, E11 1SF: Landlords_Property_License 2026-10-27 -> 2026-11-23 (high; zoho: 72C Kingswood property license.pdf)
- 72D Kingswood Road, E11 1SF: EPC_Expiry 2035-08-26 -> 2035-09-26 (high; zoho: 72 d Kingswood Road - Energy performance certificate (EPC) -.pdf)
- 72D Kingswood Road, E11 1SF: Gas_Safe_Certificate 2026-11-01 -> 2023-09-02 (medium; zoho: 72D Kingswood Road Gas certificate.2.9.23.pdf)
- F1 474 Lea Bridge Road E10 7DU: Gas_Safe_Certificate 2027-03-20 -> 2024-03-18 (medium; zoho: Flat 1, 474 Lea Bridge Road, Gas cert. 18.3.24.pdf)
- Flat 1, 253 Lea Bridge Road, E10 7NE: Gas_Safe_Certificate 2027-03-24 -> 2023-11-18 (medium; zoho: Flat 1, 253 Lea Bridge Gas cert, 18.11.23.pdf)
- Flat 1, 253 Lea Bridge Road, E10 7NE: Landlords_Property_License 2020-03-31 -> 2026-02-21 (high; zoho: Selective License Flat1, 253 Lea Bridge Road.pdf)
- Flat 1, 96 Pearcroft Road - E11 4DR: Gas_Safe_Certificate 2026-12-17 -> 2024-01-10 (medium; drive: 2026-03-18__propertysauce-co__Gas cert - Flat 1, 96 Peacroft  10.1.24.pdf)
- Flat 2, 35 Lord Street, Blackpool, FY1 2BD: NICEIC_Certificate 2030-09-23 -> 2026-04-28 (medium; zoho: Flat 2, 35 Lord Street Electric certificate.pdf)
- Flat 23, Catterick House, Cottenham Road, S65 1LD: EPC_Expiry 2032-03-29 -> 2022-01-03 (medium; zoho: 23 Catterick House, - EPC.pdf)
- Flat 3, 253 Lea Bridge Road, E10 7NE: Gas_Safe_Certificate 2027-07-14 -> 2023-07-04 (medium; zoho: Flat 3, 253 Lea Bridge Raod gas cetificate, 4.7.23.pdf)
- Flat 3, 253 Lea Bridge Road, E10 7NE: Landlords_Property_License 2020-03-31 -> 2026-03-23 (high; zoho: F3 253 Lea Bridge License.pdf)
- Flat 4, Catterick House, Cottenham Road, S65 1LD: EPC_Expiry 2034-06-25 -> 2034-08-20 (high; zoho: Flat 4 Catterick House - EPC.pdf)
- Flat 5, 35 Lord Street, Blackpool, FY1 2BD: EPC_Expiry 2034-04-06 -> 2034-04-07 (low; zoho: EPC - Flat 5 Lord Street 7.04.34.pdf)
- Flat 6, 35 Lord Street, Blackpool, FY1 2BD: EPC_Expiry 2034-01-25 -> 2034-01-30 (high; zoho: Flat 6, 35 Lord Street EPC.pdf)
- Flat C, Hollybush Lodge, 32 Grange Rd, E10 5JD: Landlords_Property_License blank -> 2025-03-23 (high; zoho: 32c Hollbysh Landlord License.pdf)
- GF 55 Coopers Lane E10 5DG: Gas_Safe_Certificate 2027-07-14 -> 2023-07-26 (medium; zoho: GF 55 Cooper Lane gas certificate, 25.7.23.pdf)
- Hawkesmead, CB10 2QS: EPC_Expiry 2031-10-24 -> 2027-12-16 (medium; zoho: EPC - Hawksmead.pdf)

## Files

- certificates-index.csv: one row per document.
- zoho-updates.csv: proposed field changes. Nothing has been written to Zoho.
