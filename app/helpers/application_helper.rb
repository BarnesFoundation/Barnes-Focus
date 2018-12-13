module ApplicationHelper
    def self.date_time_in_eastern datetime
        datetime.present? ? datetime.in_time_zone( 'Eastern Time (US & Canada)' ).strftime( '%Y-%m-%d %I:%M %p' ) : nil
    end
end
