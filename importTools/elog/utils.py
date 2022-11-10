import functools

def retry(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        n = 1
        while True:
            try:
                res = func(*args, **kwargs)
            except Exception as e:
                print_func = func.__name__
                all_args = [str(a) for a in args] + ["{k}={v}" for k, v in kwargs.items()]
                print_args = ", ".join(all_args)
                print(f"retry #{n}: {print_func}({print_args}), failed  due to:\n{e}")
                n += 1
            else:
                return res
            if n == 10: break
    return wrapper
