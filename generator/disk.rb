require 'timeout'

Timeout.timeout(120) do
  while true
    str = "test string"
    str *= 100000
    f = File.new("test.txt", "w")
    f.write(str)
    f.close
  end
end
