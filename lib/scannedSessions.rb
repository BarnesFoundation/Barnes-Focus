# Query for retrieving scanned sessions and average attempt for success match

sql = "
SELECT
  photos.album_id as album_id,
  ROUND(AVG(CAST(response_time AS INT)), 2) AS avg_response_time,
  COUNT(*) AS total_scan_attempt,
  CAST(
    SUM(
      CASE WHEN photos.result_image_url IS NOT NULL THEN 1 ELSE 0 END
    ) AS BIT
  ) AS successful_match
FROM
  photos
  INNER JOIN albums ON albums.id = photos.album_id
WHERE photos.response_time NOT LIKE 'null'
GROUP BY
  photos.album_id
ORDER BY
  photos.album_id
"

# Execute query
results = ActiveRecord::Base.connection.execute(sql)



# Export query results to CSV
require 'csv'


CSV.open("public/scannedSessions.csv", "wb") do |csv|
	csv << results.first.keys
    results.each do |row|
        csv << row.values
    end
end
