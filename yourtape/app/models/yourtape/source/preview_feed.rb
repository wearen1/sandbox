class Yourtape::Source::PreviewFeed
  ATTRIBUTES = [:title, :url, :feed_url, :description]
  attr_accessor *ATTRIBUTES
  
  def initialize(*args)
    raise ArgumentError, 'Too many arguments' if args.size > ATTRIBUTES.size

    ATTRIBUTES.map do |attr|
      if args[0][attr] != self[attr]
        send "#{ attr }=", args[0][attr]
      end
    end
  end
end