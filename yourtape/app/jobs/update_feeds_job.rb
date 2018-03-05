class UpdateFeedsJob < ActiveJob::Base
  queue_as :default

  def perform(*args)
    Source.connection
    Source.all.each(&:update_posts!)
  end
end
