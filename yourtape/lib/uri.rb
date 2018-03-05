module URI
	def get_redirect(url=nil)
		url = URI.parse(url) if url
		req = Net::HTTP.new(self.host, self.port)
		req.use_ssl = (self.scheme == 'https')
		path = self.path if self.path.present?
		res = req.send('request_' + method.to_s, (self.path or '/'))
		if res.kind_of?(Net::HTTPRedirection)
			self.get_redirect(res['location'])
		else
			self
		end
	rescue Errno::ENOENT
		false
	end

	def exists?(method=:get)
		return @_exists if defined? @_exists

		req = Net::HTTP.new(self.host, self.port)
		req.use_ssl = (self.scheme == 'https')
		path = self.path if self.path.present?
		res = req.send('request_' + method.to_s, (self.path or '/'))
		if res.kind_of?(Net::HTTPRedirection)
			redirect_url = URI.parse(res['location'])
			@_exists = redirect_url.exists?
		else
			@_exists = ! %W(4 5).include?(res.code[0])
		end
	rescue Errno::ENOENT
		false
	end

	def add_scheme(method=:get)
		url = self
		self_s = self.to_s
		unless self_s[/\Ahttp:\/\//] or self_s[/\Ahttps:\/\//]
			url = URI.parse("http://#{ self_s }")
		end

		req = Net::HTTP.new(url.host, url.port)
		req.use_ssl = (url.scheme == 'https')
		if url.path.present? then path = url.path end
		res = req.send('request_' + method.to_s, (path || '/'))
		if res.kind_of?(Net::HTTPRedirection)
			url = URI.parse(res['location'])
		else
			unless %W(4 5).include?(res.code[0]) # Not from 4xx or 5xx families
				url
			else
				nil
			end
		end
	end
  
  def self.normalize(url_s)
    parsed_url = URI.parse(url_s)
    parsed_url = URI.parse(Addressable::URI.parse(parsed_url.add_scheme.to_s).normalize.to_s)

    parsed_url.scheme = 'https' unless parsed_url.exists?
    if (parsed_url.to_s =~ URI::regexp).nil? and !parsed_url.exists? then throw invalid_url_error end

    parsed_url
  end
end
