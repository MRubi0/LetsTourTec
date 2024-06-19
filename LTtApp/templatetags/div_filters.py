from django import template

register = template.Library()

@register.filter
def div(value, arg):
    try:
        if value is None or arg is None:
            return 0 
        return float(value) / float(arg)
    except (ValueError, ZeroDivisionError):
        return 0


