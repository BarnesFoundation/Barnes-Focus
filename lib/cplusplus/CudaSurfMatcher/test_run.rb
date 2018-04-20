#!/usr/bin/env ruby
require 'json'
LOG_LEVEL = ENV['LOG_LEVEL'] || 'info' #debug, info
TEST_IMAGES_ROOT = "#{Rails.root}/lib/cplusplus/CudaSurfMatcher/test-images"

SEARCH_ENDP_A = "http://ec2-34-207-152-196.compute-1.amazonaws.com:42129/index/searcher"
SEARCH_ENDP_B = "http://ec2-52-201-253-112.compute-1.amazonaws.com:42129/index/searcher"

def log(str)
  puts str if LOG_LEVEL == 'debug'
end

def cmd(str)
  log str 
  return `#{str}`
end

def run_image_test(image_name)
  test_image_path = "#{TEST_IMAGES_ROOT}/#{image_name}"  
  puts "#{test_image_path} doesn't exist" if !File.file?(test_image_path)

  if image_name.split("-").length != 2
    log("skipping #{image_name} as filename doesn't contain result identifier; filename should be anyname-correctmatchid.jpeg")
    return { skipped: true }
  end

  results = {}
  t_a = Thread.new do
    out1 = cmd "curl -s -X POST --data-binary @#{test_image_path} #{SEARCH_ENDP_A}"
    results['a'] = JSON.parse(out1)
    log "OUTPUT A => #{results['a']}"
  end

  t_b = Thread.new do
    out2 = cmd "curl -s -X POST --data-binary @#{test_image_path} #{SEARCH_ENDP_B}"
    results['b'] = JSON.parse(out2)
    log "OUTPUT B => #{results['b']}"
  end

  t_a.join
  t_b.join
  final = (results['a']['results'] + results['b']['results'])
  final = final.collect{|obj| obj.to_a.flatten }
  final = final.sort{|x, y| y[1] <=> x[1] }
  log "final => #{final}"
  top = final.first
  log "top => #{top}"
  filename = top.first
  base_name = File.basename(filename, ".*")
  id_on_top_result = base_name.split("_")[0]
  id_on_test_image = File.basename(image_name, ".*").split("-")[1]
  log "id_on_top_result => #{id_on_top_result}; id_on_test_image => #{id_on_test_image}"
  if id_on_top_result == id_on_test_image
    print "\e[32mP\e[39m"
    return { passed: true }
  else
    print "\e[31mF\e[39m"
    return { failed: true }
  end
end

if ARGV.length > 0
  filename = "#{ARGV[0]}"
  filename << ".jpeg" if !filename.include?(".") # add extention if not provided
  run_image_test(filename)
else
  puts "running all test files.."
  paths = Dir["#{TEST_IMAGES_ROOT}/*.jpeg"]
  total_tests = 0
  passed_count = 0
  paths.each do |path|
    filename = File.basename(path)
    # run_image_test('442-5825.jpeg')
    result = run_image_test(filename)
    if result[:skipped]
    elsif result[:passed]
      total_tests += 1
      passed_count += 1
    elsif result[:failed]
      total_tests += 1   
    end
  end
  puts "\n total: #{total_tests}; passed: #{passed_count} (#{((passed_count.to_f/total_tests.to_f)*100.0).round}%)"  
end