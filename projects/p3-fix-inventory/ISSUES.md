# Problems reported by Maya Brooks

1. **The first item is missing.** `node cli.js low` and `search` never show HL-1001
   (Deck Screws), even though it's the first row of the export.
2. **Wood glue never shows as low.** We have 12 and the reorder level is 12. That's the
   point where we're supposed to reorder.
3. **The stock value is too low.** The tool says $1,735.00. My spreadsheet says
   $2,184.70.
4. **The order quantities look random.** We have 8 pine boards and order up to 60, so we
   should order 52. The tool says 45.
5. **Search only works if I type capitals.** `search GLUE` finds nothing; `search Glue` does.
6. **We sold paint rollers we didn't have.** Someone recorded a sale of 8 roller kits when
   we only had 5, and the tool showed -3 in stock. It should refuse the sale.
