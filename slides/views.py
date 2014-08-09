from django.shortcuts import render
from django.views.generic import TemplateView, DetailView

from .models import Stack

class HomeView(TemplateView):
    template_name = 'base.html'

class StackInitView(DetailView):
    model = Stack
    template_name = 'stack_init.html'

class StackView(DetailView):
    model = Stack
    template_name = 'stack.html'
