require 'timeout'

Timeout.timeout(120) do
  a = 1
  a += 1 while true
end
