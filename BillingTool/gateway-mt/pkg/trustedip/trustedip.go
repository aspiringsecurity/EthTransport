// Copyright (C) 2021 Storj Labs, Inc.
// See LICENSE for copying information.

package trustedip

import (
	"net/http"
	"regexp"
	"strings"
)

// List is a list of trusted IPs for conveniently verifying if an IP is trusted.
type List struct {
	// ips is the list of trusted IPs. It's used when untrustAll is false. When
	// empty it trusts any IP.
	ips        map[string]struct{}
	untrustAll bool
}

// NewListUntrustAll creates a new List which doesn't trust in any IP.
func NewListUntrustAll() List {
	return List{untrustAll: true}
}

// NewListTrustAll creates a new List which trusts any IP.
func NewListTrustAll() List {
	return List{}
}

// NewList creates a new List which trusts the passed ips.
//
// NOTE: ips are not checked to be well formatted and their values are what they
// kept in the list.
func NewList(ips ...string) List {
	l := List{ips: make(map[string]struct{}, len(ips))}

	for _, ip := range ips {
		l.ips[ip] = struct{}{}
	}

	return l
}

// IsTrusted returns true if ip is trusted, otherwise false.
func (l List) IsTrusted(ip string) bool {
	if l.untrustAll {
		return false
	}

	if len(l.ips) == 0 {
		return true
	}

	_, ok := l.ips[ip]
	return ok
}

// GetClientIP gets the IP of the client from the 'Forwarded',
// 'X-Forwarded-For', or 'X-Real-Ip' headers if r.RemoteAddr is a trusted IP and
// returning it from the first header which are checked in that specific order.
// If the IP isn't trusted then it returns r.RemoteAddr.
// It panics if r is nil.
//
// If an address contains the port, it's stripped. Addresses with ports are
// accepted in r.RemoteAddr and 'Forwarded' header.
//
// NOTE: it doesn't check that the IP value get from wherever source is a well
// formatted IP v4 nor v6, because it's expected that it's. It also expect that
// request has been created from a trusted source (e.g. http.Server).
func GetClientIP(l List, r *http.Request) string {
	addr := stripPort(r.RemoteAddr)
	if l.IsTrusted(addr) {
		ip, ok := GetIPFromHeaders(r.Header)
		if ok {
			return ip
		}
	}

	return addr
}

var forwardForClientIPRegExp = regexp.MustCompile(`(?i:(?:^|;)for=([^,; ]+))`)

// GetIPFromHeaders gets the IP of the client from the first exiting header in
// this order: 'Forwarded', 'X-Forwarded-For', or 'X-Real-Ip'.
// It returns the IP and true if the any of the headers exists, otherwise false.
//
// The 'for' field of the 'Forwarded' may contain the IP with a port, as defined
// in the RFC 7239. When the header contains the IP with a port, the port is
// striped, so only the IP is returned.
//
// NOTE: it doesn't check that the IP value get from wherever source is a well
// formatted IP v4 nor v6; an invalid formatted IP will return an undefined
// result.
func GetIPFromHeaders(headers http.Header) (string, bool) {
	h := headers.Get("Forwarded")
	if h != "" {
		// Get the first value of the 'for' identifier present in the header because
		// its the one that contains the client IP.
		// see: https://datatracker.ietf.org/doc/html/rfc7230
		matches := forwardForClientIPRegExp.FindStringSubmatch(h)
		if len(matches) > 1 {
			ip := strings.Trim(matches[1], `"`)
			ip = stripPort(ip)
			if ip[0] == '[' {
				ip = ip[1 : len(ip)-1]
			}

			return ip, true
		}
	}

	h = headers.Get("X-Forwarded-For")
	if h != "" {
		// Get the first the value IP because it's the client IP.
		// Header sysntax: X-Forwarded-For: <client>, <proxy1>, <proxy2>
		// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
		ips := strings.SplitN(h, ",", 2)
		if len(ips) > 0 {
			return ips[0], true
		}
	}

	h = headers.Get("X-Real-Ip")
	if h != "" {
		// Get the value of the header because its value is just the client IP.
		// This header is mostly sent by NGINX.
		// See https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/
		return h, true
	}

	return "", false
}

// stripPort strips the port from addr when it has it and return the host
// part. A host can be a hostname or an IP v4 or an IP v6.
//
// NOTE: this function expects a well-formatted address. When it's hostname or
// IP v4, the port at the end and separated with a colon, nor hostname or IP can
// have colons; when it's a IP v6 with port the IP part is enclosed with square
// brackets (.i.e []) and the port separated with a colon, otherwise the IP
// isn't enclosed by square brackets.
// An invalid addr produce an unspecified value.
func stripPort(addr string) string {
	// Ensure to strip the port out if r.RemoteAddr has it.
	// We don't use net.SplitHostPort because the function returns an error if the
	// address doesn't contain the port and the returned host is an empty string,
	// besides it doesn't return an error that can be distinguished from others
	// unless that the error message is compared, which is discouraging.
	if addr == "" {
		return ""
	}

	// It's an IP v6 with port.
	if addr[0] == '[' {
		idx := strings.LastIndex(addr, ":")
		if idx <= 1 {
			return addr
		}

		return addr[1 : idx-1]
	}

	// It's a IP v4 with port.
	if strings.Count(addr, ":") == 1 {
		idx := strings.LastIndex(addr, ":")
		if idx < 0 {
			return addr
		}

		return addr[0:idx]
	}

	// It's a IP v4 or v6 without port.
	return addr
}
