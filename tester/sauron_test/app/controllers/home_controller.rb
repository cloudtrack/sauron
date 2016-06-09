require 'timeout'
require 'open-uri'

class HomeController < ApplicationController
  def index
  end

  def cpu
    Timeout.timeout(5) do
      a = 1
      a += 1 while true
    end rescue nil

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
    end rescue nil

    head :ok
  end

  def network
    Timeout.timeout(5) do
      while true
        open("https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?fm=png")
      end
    end rescue nil

    head :ok
  end

  def database
    Timeout.timeout(2) do
      TestModel.create(test_string: SecureRandom.hex.first(10), test_integer: rand(1000000))
    end rescue nil

    head :ok
  end
end
