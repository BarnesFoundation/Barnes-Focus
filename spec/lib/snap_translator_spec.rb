require 'rails_helper'
require 'snap_translator'
require 'google_translate'

describe 'SnapTranslator' do
    short_description = "When Renoir first exhibited this painting publicly audiences were shocked by its naturalism."
    title = "Eroticism in 19th-century painting"

    describe 'translate_short_desc' do 
        it 'handles empty strings and nil' do
            expect(SnapTranslator.translate_short_desc("", "en")).to eq("")
            expect(SnapTranslator.translate_short_desc(nil, "en")).to eq(nil)
        end

        it 'does not call GoogleTranslate if preferred_language is "en"' do
            expect_any_instance_of(GoogleTranslate).to_not receive(:translate)
            SnapTranslator.translate_short_desc(short_description, 'en')
        end

        it 'calls GoogleTranslate if preferred_language is not "en"' do
            expect_any_instance_of(GoogleTranslate).to receive(:translate).with(short_description)
            SnapTranslator.translate_short_desc(short_description, 'it')
        end

        it 'returns text if there is an error calling GoogleTranslate API' do
            GoogleTranslate.any_instance.stub(:translate).and_raise(StandardError)
            expect(SnapTranslator.translate_short_desc(short_description, 'it')).to eq(short_description)
        end
    end

    describe 'translate_story_content' do
        it 'handles empty strings and nil' do
            expect(SnapTranslator.translate_story_content("", "en")).to eq({"html" => ""})
            expect(SnapTranslator.translate_story_content(nil, "en")).to eq({"html" => nil})
        end

        it 'does not call GoogleTranslate if preferred_language is "en"' do
            expect_any_instance_of(GoogleTranslate).to_not receive(:translate)
            SnapTranslator.translate_story_content(short_description, 'en')
        end

        it 'calls GoogleTranslate if preferred_language is not "en"' do
            expect_any_instance_of(GoogleTranslate).to receive(:translate).with(short_description)
            SnapTranslator.translate_story_content(short_description, 'it')
        end

        it 'returns text if there is an error calling GoogleTranslate API' do
            GoogleTranslate.any_instance.stub(:translate).and_raise(StandardError)
            expect(SnapTranslator.translate_story_content(short_description, 'it')).to eq({"html" => short_description})
        end
    end

    describe 'translate_story_title' do 
        it 'handles empty strings and nil' do
            expect(SnapTranslator.translate_story_title("", "en")).to eq("")
            expect(SnapTranslator.translate_story_title(nil, "en")).to eq(nil)
        end

        it 'does not call GoogleTranslate if preferred_language is "en"' do
            expect_any_instance_of(GoogleTranslate).to_not receive(:translate)
            SnapTranslator.translate_story_title(title, 'en')
        end

        it 'calls GoogleTranslate if preferred_language is not "en"' do
            expect_any_instance_of(GoogleTranslate).to receive(:translate).with(title)
            SnapTranslator.translate_story_title(title, 'it')
        end

        it 'returns text if there is an error calling GoogleTranslate API' do
            GoogleTranslate.any_instance.stub(:translate).and_raise(StandardError)
            expect(SnapTranslator.translate_story_title(title, 'it')).to eq(title)
        end
    end
end 