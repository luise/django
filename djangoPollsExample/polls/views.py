from django.shortcuts import render, get_object_or_404
from django.template import loader
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
from .models import Choice, Question
# Create your views here.

def index(request):
    latest_question_list = Question.objects.order_by('-pub_date')[:5]
    context = {
        'latest_question_list': latest_question_list,
    }
    return render(request, 'polls/index.html', context)

def detail(request, question_id):
    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist:
        raise Http404("Question does not exist")
    choices = Choice.objects(question=question)
    return render(request, 'polls/detail.html', {'choices': choices, 'question': question})

def results(request, question_id):
    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist:
        raise Http404("Question does not exist")
    choices = Choice.objects(question=question)
    return render(request, 'polls/results.html', {'choices': choices, 'question': question})

def vote(request, question_id):
    question = Question.objects.get(pk=question_id)
    try:
        selected_choice = Choice.objects.get(pk=request.POST['choice'])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(request, 'polls/detail.html', {
            'question': question,
            'error_message': "You didn't select a choice.",
        })
    else:
        selected_choice.votes += 1
        selected_choice.save()
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse('polls:results', args=(question.pk,)))

def add_poll(request):
    question_text = request.POST['question']
    choice1 = request.POST['choice1']
    choice2 = request.POST['choice2']
    question = Question(question_text=question_text, pub_date=timezone.now())
    c1 = Choice(question=question, choice_text=choice1, votes=0)
    c2 = Choice(question=question, choice_text=choice2, votes=0)
    question.save()
    c1.save()
    c2.save()
    return HttpResponseRedirect('/')

