class Comment < Feedback
  belongs_to :file_nodes
  belongs_to :directories
  
  validates :text, :length => { :minimum => 1 }
end
