require "cgi"
require "fileutils"
 
# dir以下を再帰的に変換する
def convert(dir)
  Dir.chdir(dir) do
    Dir.glob("*").each do |filename|
      if filename.include?("%")
        newname = CGI.unescape(filename)
        puts "#{filename} -> #{newname}"
        FileUtils.mv(filename, newname)
      end
    end
    Dir.glob("*").each do |filename|
      if File.directory?(filename)
        convert(filename)
      end
    end
  end
end
 
convert(".")