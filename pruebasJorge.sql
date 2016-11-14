SELECT COUNT(DISTINCT "ptps"."id")
FROM "ptps"
INNER JOIN "items"
ON "ptps"."item_id" = "items"."id"
WHERE "items"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566'
AND "ptps"."visitor_id"
IN (
  SELECT DISTINCT "visitors"."id"
  FROM "visitors"
  LEFT OUTER JOIN "visits"
  ON "visits"."visitor_id" = "visitors"."id"
  WHERE "visitors"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566'
  AND ("visits"."iso_country"
    IN ('FR', 'DE', 'ES')
  AND "visits"."device_type"
    IN ('desktop', 'tablet', 'mobile'))
)
AND (
  ptps.created_at > '2016-07-01'
  AND ptps.created_at < '2016-07-31'
);

SELECT COUNT(DISTINCT "visits"."id")
FROM "visits"
WHERE "visits"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566'
AND ("visits"."created_at"
  BETWEEN '2016-07-01 00:00:00.000000'
  AND '2016-07-31 23:59:59.000000')
AND "visits"."visitor_id"
IN (
  SELECT DISTINCT "visitors"."id"
  FROM "visitors"
  LEFT OUTER JOIN "visits"
  ON "visits"."visitor_id" = "visitors"."id"
  WHERE "visits"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566'
  AND "visitors"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566'
  AND (
    "visits"."iso_country" IN ('FR', 'DE', 'ES')
    AND "visits"."device_type" IN ('desktop', 'tablet', 'mobile')
  )
)


EXPLAIN ANALYZE SELECT DISTINCT "visitors"."id" FROM "visitors" LEFT OUTER JOIN "visits" ON "visits"."visitor_id" = "visitors"."id" WHERE "visitors"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566';

SELECT COUNT(DISTINCT "visits"."id") FROM "visits" WHERE "visits"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566' AND ("visits"."created_at" BETWEEN '2016-07-01 00:00:00.000000' AND '2016-07-31 23:59:59.000000') AND "visits"."visitor_id" IN (SELECT DISTINCT "visitors"."id" FROM "visitors" LEFT OUTER JOIN "visits" ON "visits"."visitor_id" = "visitors"."id" WHERE "visitors"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566' AND (("visits"."device_type" IN ('desktop', 'tablet', 'mobile') AND "visits"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566') AND ("visits"."iso_country" IN ('FR', 'ES', 'AT') AND "visits"."affiliate_id" = 'aa0a744a-0ccc-4860-b6fc-634667b81566')))


add_index :visits,         [:affiliate_id]
add_index :visits,         [:affiliate_id, :created_at]
add_index :visits,         [:visitor_id, :iso_country, :device_type]
add_index :visits,         [:affiliate_id, :iso_country]
add_index :visits,         [:affiliate_id, :device_type]
add_index :visits,         [:affiliate_id, :iso_country, :device_type] 
