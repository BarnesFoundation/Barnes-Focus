require 'rails_helper'
require 'story_fetcher'
require 'snap_translator'
require 'google_translate'
require 'rails'

describe StoryFetcher do
    original_response = {
        "data"=>{
            "storiesForObjectIds"=>[
                {
                    "id"=>"ck08l3egym3lu0a30c0atfcmp", 
                    "objectID"=>5323, 
                    "relatedStories"=>[
                        {   
                            "id"=>"cjy4n74iirrzn0a30p7eu97k0", 
                            "storyTitle"=>"Eroticism in 19th-century painting", 
                            "alternativeHeroImageObjectID"=>"5334", 
                            "objectID1"=>"5230", 
                            "shortParagraph1"=>{"html"=>"<p>The female nude was an extremely popular subject in the 19th century.</p>"}, 
                            "longParagraph1"=>{"html"=>"<p>The female nude was an extremely popular subject in the 19th century.</p>"}, 
                            "objectID2"=>"5323", 
                            "shortParagraph2"=>{"html"=>"<p>This Renoir shocked audiences when it was first shown in 1875.</p>"}, 
                            "longParagraph2"=>{"html"=>"<p>This Renoir shocked audiences when it was first shown in 1875.</p>"}, 
                            "objectID3"=>"5221", 
                            "shortParagraph3"=>{"html"=>"<p>Rather than an imaginary Venus, Courbet presents a frank scene of sex for sale.</p>"}, 
                            "longParagraph3"=>{"html"=>"<p>Rather than an imaginary Venus, Courbet presents a frank scene of sex for sale.</p>"}, 
                            "objectID4"=>"5226", 
                            "shortParagraph4"=>{"html"=>"<p>Degas also pushed against convention.</p>"}, 
                            "longParagraph4"=>{"html"=>"<p>Degas also pushed against convention.</p>"}, 
                            "objectID5"=>nil, 
                            "shortParagraph5"=>{"html"=>nil}, 
                            "longParagraph5"=>{"html"=>nil}, 
                            "objectID6"=>nil, 
                            "shortParagraph6"=>{"html"=>nil}, 
                            "longParagraph6"=>{"html"=>nil}
                        }
                    ]
                }
            ]
        }
    }

    formatted_data = {
        :unique_identifier=>"cjy4n74iirrzn0a30p7eu97k0", 
        :content=>{
            "story_title"=>"Eroticism in 19th-century painting", 
            "original_story_title"=>"Eroticism in 19th-century painting", 
            "stories"=>[
                {
                    "image_id"=>"5230", 
                    "short_paragraph"=>{"html"=>"<p>The female nude was an extremely popular subject in the 19th century.</p>"}, 
                    "long_paragraph"=>{"html"=>"<p>The female nude was an extremely popular subject in the 19th century.</p>"}, 
                    "detail"=>{
                        "id"=>5230, 
                        "room"=>"Room 07", 
                        "invno"=>"BF301", 
                        "title"=>"Bather (Baigneuse)", 
                        "medium"=>"Oil on canvas", 
                        "people"=>"Pierre-Auguste Renoir", 
                        "culture"=>"", 
                        "birthDate"=>"1841", 
                        "deathDate"=>"1919", 
                        "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, East Wall", 
                        "creditLine"=>"", 
                        "dimensions"=>"Overall: 32 3/16 x 25 3/4 in. (81.8 x 65.4 cm)", 
                        "displayDate"=>"1895", 
                        "imageSecret"=>"HRvCLuLrncjVGQzw", 
                        "nationality"=>"French", 
                        "ensembleIndex"=>"26", 
                        "classification"=>"Paintings", 
                        "shortDescription"=>"", 
                        "visualDescription"=>"", 
                        "curatorialApproval"=>"true", 
                        "art_url"=>"https://barnes-images.imgix.net/5230_HRvCLuLrncjVGQzw_b.jpg"
                    }
                }, {
                    "image_id"=>"5323",
                    "short_paragraph"=>{"html"=>"<p>This Renoir shocked audiences when it was first shown in 1875.</p>"}, 
                    "long_paragraph"=>{"html"=>"<p>This Renoir shocked audiences when it was first shown in 1875.</p>"}, 
                    "detail"=>{
                        "id"=>5323, 
                        "room"=>"Room 07",
                        "invno"=>"BF9",
                        "title"=>"Before the Bath (Avant le bain)",
                        "medium"=>"Oil on canvas",
                        "people"=>"Pierre-Auguste Renoir",
                        "culture"=>"",
                        "birthDate"=>"1841",
                        "deathDate"=>"1919",
                        "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, West Wall",
                        "creditLine"=>"",
                        "dimensions"=>"Overall: 32 5/16 x 26 3/16 in. (82 x 66.5 cm)",
                        "displayDate"=>"c. 1875",
                        "imageSecret"=>"eSc0a53xcEA6mkLr",
                        "nationality"=>"French",
                        "ensembleIndex"=>"28",
                        "classification"=>"Paintings",
                        "shortDescription"=>"<p>When Renoir first exhibited this painting publicly audiences were shocked by its naturalism.</p>",
                        "visualDescription"=>"",
                        "curatorialApproval"=>"true",
                        "art_url"=>"https://barnes-images.imgix.net/5323_eSc0a53xcEA6mkLr_b.jpg"
                    }
                }, {
                    "image_id"=>"5221",
                    "short_paragraph"=>{"html"=>"<p>Rather than an imaginary Venus, Courbet presents a frank scene of sex for sale.</p>"}, 
                    "long_paragraph"=>{"html"=>"<p>Rather than an imaginary Venus, Courbet presents a frank scene of sex for sale.</p>"}, 
                    "detail"=>{
                        "id"=>5221, 
                        "room"=>"Room 07",
                        "invno"=>"BF810",
                        "title"=>"Woman with White Stockings (La Femme aux bas blancs)",
                        "medium"=>"Oil on canvas",
                        "people"=>"Gustave Courbet",
                        "culture"=>"",
                        "birthDate"=>"1819",
                        "deathDate"=>"1877",
                        "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, East Wall",
                        "creditLine"=>"",
                        "dimensions"=>"Overall: 25 9/16 x 31 7/8 in. (65 x 81 cm)",
                        "displayDate"=>"1864",
                        "imageSecret"=>"ocUCQn3cjlGbvi9o",
                        "nationality"=>"French",
                        "ensembleIndex"=>"26",
                        "classification"=>"Paintings",
                        "shortDescription"=>"<p>European painters made the nude subject decorous by presenting it as part of a mythological narrative.</p>",
                        "visualDescription"=>"European painters made the nude subject decorous by presenting it as part of a mythological narrative.",
                        "curatorialApproval"=>"true",
                        "art_url"=>"https://barnes-images.imgix.net/5221_ocUCQn3cjlGbvi9o_b.jpg"
                    }
                }, {
                    "image_id"=>"5226",
                    "short_paragraph"=>{"html"=>"<p>Degas also pushed against convention.</p>"}, 
                    "long_paragraph"=>{"html"=>"<p>Degas also pushed against convention.</p>"}, 
                    "detail"=>{
                        "id"=>5226, 
                        "room"=>"Room 07",
                        "invno"=>"BF153",
                        "title"=>"Bathers",
                        "medium"=>"Pastel with charcoal underdrawing on blue (?) wove paper",
                        "people"=>"Edgar Degas",
                        "culture"=>"",
                        "birthDate"=>"1834",
                        "deathDate"=>"1917",
                        "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, North Wall",
                        "creditLine"=>"",
                        "dimensions"=>"Overall: 23 1/4 x 29 in. (59.1 x 73.7 cm)Image: 23 1/4 x 29 in. (59.1 x 73.7 cm)",
                        "displayDate"=>"1895–1900",
                        "imageSecret"=>"yqYBY6Fio9jbnD9h",
                        "nationality"=>"French",
                        "ensembleIndex"=>"25",
                        "classification"=>"Paintings",
                        "shortDescription"=>"<p>One of the things that made Degas such a radical artist was his approach to representing the human form.</p>",
                        "visualDescription"=>"",
                        "curatorialApproval"=>"true",
                        "art_url"=>"https://barnes-images.imgix.net/5226_yqYBY6Fio9jbnD9h_b.jpg"
                    }
                }
            ]
        }, 
        :total=>4
    }

    arts = [
        {
            "id"=>5226, 
            "room"=>"Room 07",
            "invno"=>"BF153",
            "title"=>"Bathers",
            "medium"=>"Pastel with charcoal underdrawing on blue (?) wove paper",
            "people"=>"Edgar Degas",
            "culture"=>"",
            "birthDate"=>"1834",
            "deathDate"=>"1917",
            "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, North Wall",
            "creditLine"=>"",
            "dimensions"=>"Overall: 23 1/4 x 29 in. (59.1 x 73.7 cm)Image: 23 1/4 x 29 in. (59.1 x 73.7 cm)",
            "displayDate"=>"1895–1900",
            "imageSecret"=>"yqYBY6Fio9jbnD9h",
            "nationality"=>"French",
            "ensembleIndex"=>"25",
            "classification"=>"Paintings",
            "shortDescription"=>"<p>One of the things that made Degas such a radical artist was his approach to representing the human form.</p>",
            "visualDescription"=>"",
            "curatorialApproval"=>"true",
            "art_url"=>"https://barnes-images.imgix.net/5226_yqYBY6Fio9jbnD9h_b.jpg"
        }, {
            "id"=>5221, 
            "room"=>"Room 07",
            "invno"=>"BF810",
            "title"=>"Woman with White Stockings (La Femme aux bas blancs)",
            "medium"=>"Oil on canvas",
            "people"=>"Gustave Courbet",
            "culture"=>"",
            "birthDate"=>"1819",
            "deathDate"=>"1877",
            "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, East Wall",
            "creditLine"=>"",
            "dimensions"=>"Overall: 25 9/16 x 31 7/8 in. (65 x 81 cm)",
            "displayDate"=>"1864",
            "imageSecret"=>"ocUCQn3cjlGbvi9o",
            "nationality"=>"French",
            "ensembleIndex"=>"26",
            "classification"=>"Paintings",
            "shortDescription"=>"<p>European painters made the nude subject decorous by presenting it as part of a mythological narrative.</p>",
            "visualDescription"=>"European painters made the nude subject decorous by presenting it as part of a mythological narrative.",
            "curatorialApproval"=>"true",
            "art_url"=>"https://barnes-images.imgix.net/5221_ocUCQn3cjlGbvi9o_b.jpg"
        }, {
            "id"=>5323, 
            "room"=>"Room 07",
            "invno"=>"BF9",
            "title"=>"Before the Bath (Avant le bain)",
            "medium"=>"Oil on canvas",
            "people"=>"Pierre-Auguste Renoir",
            "culture"=>"",
            "birthDate"=>"1841",
            "deathDate"=>"1919",
            "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, West Wall",
            "creditLine"=>"",
            "dimensions"=>"Overall: 32 5/16 x 26 3/16 in. (82 x 66.5 cm)",
            "displayDate"=>"c. 1875",
            "imageSecret"=>"eSc0a53xcEA6mkLr",
            "nationality"=>"French",
            "ensembleIndex"=>"28",
            "classification"=>"Paintings",
            "shortDescription"=>"<p>When Renoir first exhibited this painting publicly audiences were shocked by its naturalism.</p>",
            "visualDescription"=>"",
            "curatorialApproval"=>"true",
            "art_url"=>"https://barnes-images.imgix.net/5323_eSc0a53xcEA6mkLr_b.jpg"
        }, {
            "id"=>5230, 
            "room"=>"Room 07", 
            "invno"=>"BF301", 
            "title"=>"Bather (Baigneuse)", 
            "medium"=>"Oil on canvas", 
            "people"=>"Pierre-Auguste Renoir", 
            "culture"=>"", 
            "birthDate"=>"1841", 
            "deathDate"=>"1919", 
            "locations"=>"Barnes Foundation (Philadelphia), Collection Gallery, Room 07, East Wall", 
            "creditLine"=>"", 
            "dimensions"=>"Overall: 32 3/16 x 25 3/4 in. (81.8 x 65.4 cm)", 
            "displayDate"=>"1895", 
            "imageSecret"=>"HRvCLuLrncjVGQzw", 
            "nationality"=>"French", 
            "ensembleIndex"=>"26", 
            "classification"=>"Paintings", 
            "shortDescription"=>"", 
            "visualDescription"=>"", 
            "curatorialApproval"=>"true", 
            "art_url"=>"https://barnes-images.imgix.net/5230_HRvCLuLrncjVGQzw_b.jpg"
        }
    ]

    it "should initialize" do
        n = StoryFetcher.new
        expect(n).to be_instance_of StoryFetcher
    end

    describe "get_stories_details" do
        it "should return formatted stories array" do
            story_fetcher = StoryFetcher.new
            story_attrs = original_response["data"]["storiesForObjectIds"][0]["relatedStories"].first
            translatable_content = story_fetcher.get_translatable_content(story_attrs, 5323, 'en')
            stories = (story_fetcher.get_stories(story_attrs, 5323, translatable_content))
            expect(story_fetcher.get_stories_details(stories, arts, translatable_content)).to eq(formatted_data[:content]['stories'])
        end
    end 

    describe "get_translatable_content" do 
        it "should return empty hash for english translations" do 
            story_attrs = original_response["data"]["storiesForObjectIds"][0]["relatedStories"].first
            expect(StoryFetcher.new.get_translatable_content(story_attrs, 5323, 'en')).to eq({})
        end

        it "should return formatted hash for other translations" do
            story_attrs = original_response["data"]["storiesForObjectIds"][0]["relatedStories"].first
            expect(StoryFetcher.new.get_translatable_content(story_attrs, 5323, 'it')).to eq({"5230"=>"<p> Il nudo femminile era un soggetto estremamente popolare nel XIX secolo.</p> ",
            "5323"=>
             "<p> Questo Renoir ha scioccato il pubblico quando è stato mostrato per la prima volta nel 1875.</p> ",
            "5221"=>
             "<p> Piuttosto che una Venere immaginaria, Courbet presenta una scena di sesso schietta in vendita.</p> ",
            "5226"=>"<p> Degas ha anche spinto contro le convenzioni.</p>"})
        end
    end
end 