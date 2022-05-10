---
title: "golang | []byte 和 string 的区别与适用场景"
date: 2022-03-03T10:44:06+08:00
draft: false
---


[]byte 和 string 有什么区别？类型转换需要拷贝数据吗？如何选择正确的类型？

[]byte和string的类型字义非常类似，[]byte 比 string 多一个 cap 成员。string 在大多数的语言中都表示不可变字符串，[]byte 则是可以修改的数组分片。所以在做 []byte 和 string 转换的时候，如果只是简单的将指针复制，就相当于同一块内存同时有了可变和不可变引用，修改了 []byte 会影响到 string 的不可变性（rust 选手应该比较熟悉）。所以做类型转换时，会额外的有内存申请与数据拷贝动作。

至于在编码的时候该选择哪个类型，可以参考 [andybalholm](https://stackoverflow.com/users/1097065/andybalholm) 的回答：尽量使用 string ，除非要频繁修改字符串或者要与使用的接口保持一致。


    My advice would be to use string by default when you're working with text. But use []byte instead if one of the following conditions applies:

    - The mutability of a []byte will significantly reduce the number of allocations needed.
    - You are dealing with an API that uses []byte, and avoiding a conversion to string will simplify your code.

```golang
type slice struct {
    data uintptr
    len int
    cap int
}

type string struct {
    data uintptr
    len int
}

// ByteSliceFromString returns a NUL-terminated slice of bytes
// containing the text of s. If s contains a NUL byte at any
// location, it returns (nil, syscall.EINVAL).
func ByteSliceFromString(s string) ([]byte, error) {
	if strings.IndexByte(s, 0) != -1 {
		return nil, syscall.EINVAL
	}
	a := make([]byte, len(s)+1)
	copy(a, s)
	return a, nil
}

```


refs
----
[https://syslog.ravelin.com/byte-vs-string-in-go-d645b67ca7ff](https://syslog.ravelin.com/byte-vs-string-in-go-d645b67ca7ff)

[https://cs.opensource.google/go/go/+/master:src/cmd/vendor/golang.org/x/sys/windows/syscall.go;l=40?q=slicetostring&ss=go%2Fgo](https://cs.opensource.google/go/go/+/master:src/cmd/vendor/golang.org/x/sys/windows/syscall.go;l=40?q=slicetostring&ss=go%2Fgo)

[https://stackoverflow.com/questions/10826651/when-to-use-byte-or-string-in-go](https://stackoverflow.com/questions/10826651/when-to-use-byte-or-string-in-go)
