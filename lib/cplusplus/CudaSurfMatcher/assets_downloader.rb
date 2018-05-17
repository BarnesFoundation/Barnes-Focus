require 'csv'
class AssetsDownloader
  def cmd(str)
    puts str
    `#{str}`
  end

  def run(opts = {})
    asset_root = opts.delete(:asset_root) || '/home/ubuntu/asset-sets'
    csv_path = opts.delete(:csv_path) || '/home/ubuntu/2D-Paintings-Small.csv'

    cmd("mkdir -p #{asset_root}")
    num_sets = 2

    1.upto(num_sets) do |i|
      cmd("mkdir -p #{asset_root}/set#{i}")
    end
    
    cmd("gunzip -c #{csv_path}.gz > #{csv_path}")
    arrs = CSV.read(csv_path, headers: true)
    puts arrs.length 
    slice_size = (arrs.length.to_f/num_sets.to_f).ceil
    puts slice_size
    sets = arrs.each_slice(slice_size).to_a
    sets.each_with_index do |set, idx|
      set.each do |row|
        puts row[1]
        url = row[1]
        puts url
        if url =~ /^http/
          cmd("wget -c #{url} -P #{asset_root}/set#{idx+1}/")
        end
      end
    end
    
    cmd("rm -f #{csv_path}")
  end

end
=begin
AssetsDownloader.new.run(asset_root: ARGV[0], csv_path: ARGV[1])
=end