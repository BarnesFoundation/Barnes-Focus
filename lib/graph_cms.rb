require 'graphql/client'
require 'graphql/client/http'

module GraphCms
    HTTP = GraphQL::Client::HTTP.new(ENV['GRAPHCMS_ENDPOINT'])

    Schema = GraphQL::Client.load_schema(HTTP)

    Client = GraphQL::Client.new(schema: Schema, execute: HTTP)

    # Fragment definitions
    StoriesFragment = Client.parse <<-'GRAPHQL'
      fragment  on Stories {
          id
          storyTitle
          alternativeHeroImageObjectID
          objectID1
          shortParagraph1 {
            html
          }
          longParagraph1 {
            html
          }
          objectID2
          shortParagraph2 {
            html
          }
          longParagraph2 {
            html
          }
          objectID3
          shortParagraph3 {
            html
          }
          longParagraph3 {
            html
          }
          objectID4
          shortParagraph4 {
            html
          }
          longParagraph4 {
            html
          }
          objectID5
          shortParagraph5 {
            html
          }
          longParagraph5 {
            html
          }
          objectID6
          shortParagraph6 {
            html
          }
          longParagraph6 {
            html
          }
      }
    GRAPHQL
    
    # Query definitions
    StoriesForObjectIdsQuery = Client.parse <<-'GRAPHQL'
      query($objectID: Int) {
        storiesForObjectIds(where: { objectID: $objectID }) {
          id
          objectID
          relatedStories {
            id
          }
        }
      }
    GRAPHQL

    RelatedStoriesByObjIdQuery = Client.parse <<-'GRAPHQL'
      query($objectID: Int) {
        storiesForObjectIds(where: { objectID: $objectID }) {
          id
          objectID
          relatedStories{
            ...GraphCms::StoriesFragment
          }
        }
      }
    GRAPHQL

    RelatedStoriesByTitleQuery = Client.parse <<-'GRAPHQL'
      query($storyTitle: String) {
        storiesForObjectIds(where: { relatedStories_some: { storyTitle: $storyTitle } }) {
          id
          objectID
          relatedStories{
            ...GraphCms::StoriesFragment
          }
        }
      }
    GRAPHQL

    RelatedStoriesByRoomIdQuery = Client.parse <<-'GRAPHQL'
      query($roomID: Int) {
        storiesForRoomIds(where: { roomID: $roomID }) {
          id
          roomID
          relatedStories {
            ...GraphCms::StoriesFragment
          }
        }
      }
    GRAPHQL
end