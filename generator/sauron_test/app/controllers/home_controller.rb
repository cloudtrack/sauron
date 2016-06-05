require 'timeout'
require 'open-uri'

class HomeController < ApplicationController
  def index
  end

  def cpu
    Timeout.timeout(5) do
      a = 1
      a += 1 while true
    end

    head :ok
  end

  def disk
    Timeout.timeout(5) do
      while true
        str = "test string"
        str *= 100000
        f = File.new("test.txt", "w")
        f.write(str)
        f.close
      end
    end

    head :ok
  end

  def network
    Timeout.timeout(5) do
      while true
        open("https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?fm=png")
      end
    end

    head :ok
  end
end
