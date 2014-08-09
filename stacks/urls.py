from django.conf.urls import patterns, include, url


from django.contrib import admin
admin.autodiscover()



from slides.views import HomeView, StackInitView, StackView

urlpatterns = patterns('',
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^stack-init/(?P<pk>\d+)', StackInitView.as_view(), name='stack_init'),
    url(r'^stack/(?P<pk>\d+)', StackView.as_view(), name='stack'),    
    
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
