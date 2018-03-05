namespace :shared_migrations do
  desc "Runs VSPACE Shared migration"
  task up: :environment do
    V::Shared::Migrations.up
  end

  desc "Rollbacks Shared migrations"
  task down: :environment do
    V::Shared::Migrations.down
  end

end
