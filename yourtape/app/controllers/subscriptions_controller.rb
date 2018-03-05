class SubscriptionsController < InheritedResources::Base
  layout false
  actions :index, :create, :delete
  respond_to :json

  def create
    user_to_subscribe = V::User.find(params[:v_user_id])
    if user_to_subscribe
      @yourtape_subscription = current_user.yourtape_subscriptions.find_or_create_by(:v_user => user_to_subscribe)
    end
    render :json => {}, :status => 200
  end

  def destroy
    current_user.yourtape_subscriptions.where(:v_user => params[:id]).destroy_all
    render :json => {}, :status => 200
  end

  protected
    def begin_of_association_chain
      current_user
    end
end
