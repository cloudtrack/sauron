class CreateTestModels < ActiveRecord::Migration
  def change
    create_table :test_models do |t|
      t.string :test_string
      t.integer :test_integer

      t.timestamps null: false
    end
  end
end
