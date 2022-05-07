---
title: "Golang | error 的内部实现"
date: 2022-05-07T20:01:06+08:00
draft: false
---

Golang `error` 是一个包含了 `Error() string` 函数的接口，任何实现了 `Error() string` 的结构体都可以认为是 `error` 类型。

```go
// The error built-in interface type is the conventional interface for
// representing an error condition, with the nil value representing no error.
type error interface {
	Error() string
}
```

对于简单场景，返回一个带字符串描述的 `error` 可以通过 `return errors.New("this is a err")` 来实现。其内部[实现](https://go.dev/src/errors/errors.go#L58)的机制为：定义了一个 `errorString` 的结构体，调用 `Error()` 的时候返回初始化时传入的字符串。

```go
// New returns an error that formats as the given text.
// Each call to New returns a distinct error value even if the text is identical.
func New(text string) error {
	return &errorString{text}
}

// errorString is a trivial implementation of error.
type errorString struct {
	s string
}

func (e *errorString) Error() string {
	return e.s
}
```

对于稍微复杂的场景，如果希望返回的错误信息中包含格式化字符串，可以通过 `fmt.Errorf` 来实现。其内部的[实现](https://go.dev/src/fmt/errors.go)为：通过一个 `Printer` 生成字符串，对于不包含异常的情况，调用上述的 `errors.New`。否则，返回一个 `wrapError` 结构体，保存包含的子 `error` ，并可以通过 `Unwrap` 取出。

```go
func Errorf(format string, a ...any) error {
	p := newPrinter()
	p.wrapErrs = true
	p.doPrintf(format, a)
	s := string(p.buf)
	var err error
	if p.wrappedErr == nil {
		err = errors.New(s)
	} else {
		err = &wrapError{s, p.wrappedErr}
	}
	p.free()
	return err
}

type wrapError struct {
	msg string
	err error
}

func (e *wrapError) Error() string {
	return e.msg
}

func (e *wrapError) Unwrap() error {
	return e.err
}
```

1. [https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully](https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully)
