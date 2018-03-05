namespace :yourtape_feeds do
  desc 'Updates feed information and recent posts'
  task :update => :environment do

    pp "Updating RSS Sources"
    Source::RSS.all.each do |p|
      pp "Updating source #{ p.title }"
      begin
        p.update_posts!
        pp "Source #{ p.title } posts updated"
      rescue Exception => e
        pp "Error occured while updating #{ p.title }"
        pp e
      end
    end
    
    pp "Updating VK Sources"
    Source::VK.all.each do |p|
      pp "Updating source #{ p.title }"
      begin
        p.update_posts!
        pp "Source #{ p.title } posts updated"
      rescue Exception => e
        pp "Error occured while updating #{ p.title }"
        pp e
      end
    end
    
    pp "Updating OK Sources"
    Source::OK.all.each do |p|
      pp "Updating source #{ p.title }"
      begin
        p.update_posts!
        pp "Source #{ p.title } posts updated"
      rescue Exception => e
        pp "Error occured while updating #{ p.title }"
        pp e
      end
    end
    
  end
end
