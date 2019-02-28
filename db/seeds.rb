# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
AdminUser.create!(email: 'admin@barnesfoundation.org', password: 'b@rne$', password_confirmation: 'b@rne$') if Rails.env.test?
AdminUser.create!(email: 'puneet@happyfuncorp.com', password: 'b@rne$', password_confirmation: 'b@rne$') if Rails.env.test?

# In version 2, we have changed the translations.
# So translations from v1 has been removed from seed file.
# Updated translations can be found under /lib/tasks/data.rake
# Instructions to load translations can be found under README.md