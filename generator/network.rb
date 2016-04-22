require 'timeout'
require 'open-uri'

Timeout.timeout(120) do
  while true
    open("http://google.com")
    sleep(1)
  end
end
