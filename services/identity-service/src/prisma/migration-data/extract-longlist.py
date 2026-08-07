#!/usr/bin/env python3
"""
One-time extraction: docs/DTI/Longlist.xlsx -> longlist-raw.json

Pure cell dump, zero business logic (no dedup, no field mapping, no
normalization) -- that all lives in ../migrate-longlist.ts. Keeping this
step dependency-free (repo's existing .venv + openpyxl) and free of logic
means the JSON output can be reviewed by eye against the spreadsheet.

Run once: .venv/bin/python3 services/identity-service/src/prisma/migration-data/extract-longlist.py
"""
import json
import re
from datetime import datetime, date
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parents[5]
SRC_XLSX = REPO_ROOT / "docs" / "DTI" / "Longlist.xlsx"
OUT_JSON = Path(__file__).resolve().parent / "longlist-raw.json"

# Column letter -> field key (matches the sheet's header row exactly)
COLUMNS = {
    "A": "startupId",
    "B": "startup",
    "C": "shortDescription",
    "D": "industry",
    "E": "specificIndustry",
    "F": "yearFounded",
    "G": "city",
    "H": "province",
    "I": "startupStage",
    "J": "operatingStatus",
    "K": "legalIdentity",
    "L": "revenueStatus",
    "M": "mrr",
    "N": "fundingStage",
    "O": "jobsCreated",
    "P": "marketsReached",
    "Q": "primaryContactPerson",
    "R": "designation",
    "S": "emailAddress",
    "T": "mobileNumber",
    "U": "website",
    "V": "socialMediaLink",
    "W": "programsParticipated",
    "X": "majorMilestones",
    "Y": "supportNeeded",
    "Z": "prioritySupportArea",
    "AA": "remarks",
    "AB": "lastUpdated",
    "AC": "previousStartup",
}


def cell_to_value(v):
    if v is None:
        return None
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, str):
        v = v.strip()
        return v if v != "" else None
    return v


def main():
    wb = openpyxl.load_workbook(SRC_XLSX, data_only=True)
    ws = wb.active

    header_cells = {c.column_letter: c.value for c in next(ws.iter_rows(min_row=1, max_row=1))}
    expected = {col: COLUMNS[col] for col in COLUMNS}
    for col, label in header_cells.items():
        if col in expected:
            assert label is not None, f"Missing header at column {col}"

    rows = []
    for row in ws.iter_rows(min_row=2):
        by_col = {c.column_letter: cell_to_value(c.value) for c in row}
        if not by_col.get("B"):
            continue  # skip placeholder rows with no company name
        record = {field: by_col.get(col) for col, field in COLUMNS.items()}
        rows.append(record)

    print(f"Extracted {len(rows)} rows with a company name (out of {ws.max_row - 1} total data rows)")
    OUT_JSON.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_JSON}")


if __name__ == "__main__":
    main()
