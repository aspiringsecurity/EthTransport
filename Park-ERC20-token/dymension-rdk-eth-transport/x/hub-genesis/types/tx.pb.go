// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: hub-genesis/tx.proto

package types

import (
	context "context"
	fmt "fmt"
	grpc1 "github.com/gogo/protobuf/grpc"
	proto "github.com/gogo/protobuf/proto"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	io "io"
	math "math"
	math_bits "math/bits"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.GoGoProtoPackageIsVersion3 // please upgrade the proto package

// MsgHubGenesisEvent is the message type for triggering the hub genesis event
type MsgHubGenesisEvent struct {
	// address is the bech32-encoded address of the sender
	Address string `protobuf:"bytes,1,opt,name=address,proto3" json:"address,omitempty"`
	// channel_id is the hub channel id on the rollapp
	ChannelId string `protobuf:"bytes,2,opt,name=channel_id,json=channelId,proto3" json:"channel_id,omitempty"`
	// hub_id is the hub's chainid
	HubId string `protobuf:"bytes,3,opt,name=hub_id,json=hubId,proto3" json:"hub_id,omitempty"`
}

func (m *MsgHubGenesisEvent) Reset()         { *m = MsgHubGenesisEvent{} }
func (m *MsgHubGenesisEvent) String() string { return proto.CompactTextString(m) }
func (*MsgHubGenesisEvent) ProtoMessage()    {}
func (*MsgHubGenesisEvent) Descriptor() ([]byte, []int) {
	return fileDescriptor_9b8a59dbc89b5c59, []int{0}
}
func (m *MsgHubGenesisEvent) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *MsgHubGenesisEvent) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_MsgHubGenesisEvent.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *MsgHubGenesisEvent) XXX_Merge(src proto.Message) {
	xxx_messageInfo_MsgHubGenesisEvent.Merge(m, src)
}
func (m *MsgHubGenesisEvent) XXX_Size() int {
	return m.Size()
}
func (m *MsgHubGenesisEvent) XXX_DiscardUnknown() {
	xxx_messageInfo_MsgHubGenesisEvent.DiscardUnknown(m)
}

var xxx_messageInfo_MsgHubGenesisEvent proto.InternalMessageInfo

func (m *MsgHubGenesisEvent) GetAddress() string {
	if m != nil {
		return m.Address
	}
	return ""
}

func (m *MsgHubGenesisEvent) GetChannelId() string {
	if m != nil {
		return m.ChannelId
	}
	return ""
}

func (m *MsgHubGenesisEvent) GetHubId() string {
	if m != nil {
		return m.HubId
	}
	return ""
}

type MsgHubGenesisEventResponse struct {
}

func (m *MsgHubGenesisEventResponse) Reset()         { *m = MsgHubGenesisEventResponse{} }
func (m *MsgHubGenesisEventResponse) String() string { return proto.CompactTextString(m) }
func (*MsgHubGenesisEventResponse) ProtoMessage()    {}
func (*MsgHubGenesisEventResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_9b8a59dbc89b5c59, []int{1}
}
func (m *MsgHubGenesisEventResponse) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *MsgHubGenesisEventResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_MsgHubGenesisEventResponse.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *MsgHubGenesisEventResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_MsgHubGenesisEventResponse.Merge(m, src)
}
func (m *MsgHubGenesisEventResponse) XXX_Size() int {
	return m.Size()
}
func (m *MsgHubGenesisEventResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_MsgHubGenesisEventResponse.DiscardUnknown(m)
}

var xxx_messageInfo_MsgHubGenesisEventResponse proto.InternalMessageInfo

func init() {
	proto.RegisterType((*MsgHubGenesisEvent)(nil), "rollapp.hub_genesis.MsgHubGenesisEvent")
	proto.RegisterType((*MsgHubGenesisEventResponse)(nil), "rollapp.hub_genesis.MsgHubGenesisEventResponse")
}

func init() { proto.RegisterFile("hub-genesis/tx.proto", fileDescriptor_9b8a59dbc89b5c59) }

var fileDescriptor_9b8a59dbc89b5c59 = []byte{
	// 262 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0x12, 0xc9, 0x28, 0x4d, 0xd2,
	0x4d, 0x4f, 0xcd, 0x4b, 0x2d, 0xce, 0x2c, 0xd6, 0x2f, 0xa9, 0xd0, 0x2b, 0x28, 0xca, 0x2f, 0xc9,
	0x17, 0x12, 0x2e, 0xca, 0xcf, 0xc9, 0x49, 0x2c, 0x28, 0xd0, 0xcb, 0x28, 0x4d, 0x8a, 0x87, 0xca,
	0x2a, 0xa5, 0x70, 0x09, 0xf9, 0x16, 0xa7, 0x7b, 0x94, 0x26, 0xb9, 0x43, 0x04, 0x5c, 0xcb, 0x52,
	0xf3, 0x4a, 0x84, 0x24, 0xb8, 0xd8, 0x13, 0x53, 0x52, 0x8a, 0x52, 0x8b, 0x8b, 0x25, 0x18, 0x15,
	0x18, 0x35, 0x38, 0x83, 0x60, 0x5c, 0x21, 0x59, 0x2e, 0xae, 0xe4, 0x8c, 0xc4, 0xbc, 0xbc, 0xd4,
	0x9c, 0xf8, 0xcc, 0x14, 0x09, 0x26, 0xb0, 0x24, 0x27, 0x54, 0xc4, 0x33, 0x45, 0x48, 0x94, 0x8b,
	0x0d, 0x64, 0x7a, 0x66, 0x8a, 0x04, 0x33, 0x58, 0x8a, 0x35, 0xa3, 0x34, 0xc9, 0x33, 0x45, 0x49,
	0x86, 0x4b, 0x0a, 0xd3, 0x96, 0xa0, 0xd4, 0xe2, 0x82, 0xfc, 0xbc, 0xe2, 0x54, 0xa3, 0x32, 0x2e,
	0x66, 0xdf, 0xe2, 0x74, 0xa1, 0x7c, 0x2e, 0xe1, 0x90, 0xa2, 0xcc, 0xf4, 0xf4, 0xd4, 0x22, 0x14,
	0xb7, 0xa8, 0xeb, 0x61, 0x71, 0xb7, 0x1e, 0xa6, 0x71, 0x52, 0xfa, 0x44, 0x2a, 0x84, 0xd9, 0xeb,
	0x14, 0x7c, 0xe2, 0x91, 0x1c, 0xe3, 0x85, 0x47, 0x72, 0x8c, 0x0f, 0x1e, 0xc9, 0x31, 0x4e, 0x78,
	0x2c, 0xc7, 0x70, 0xe1, 0xb1, 0x1c, 0xc3, 0x8d, 0xc7, 0x72, 0x0c, 0x51, 0x96, 0xe9, 0x99, 0x25,
	0x19, 0xa5, 0x49, 0x7a, 0xc9, 0xf9, 0xb9, 0xfa, 0x29, 0x95, 0xb9, 0xa9, 0x79, 0xc5, 0x99, 0xf9,
	0x79, 0x15, 0x95, 0x55, 0x08, 0x8e, 0x6e, 0x51, 0x4a, 0xb6, 0x7e, 0x85, 0x3e, 0x4a, 0x40, 0x57,
	0x16, 0xa4, 0x16, 0x27, 0xb1, 0x81, 0x03, 0xdb, 0x18, 0x10, 0x00, 0x00, 0xff, 0xff, 0x43, 0xad,
	0x71, 0xfc, 0x84, 0x01, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// MsgClient is the client API for Msg service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type MsgClient interface {
	TriggerGenesisEvent(ctx context.Context, in *MsgHubGenesisEvent, opts ...grpc.CallOption) (*MsgHubGenesisEventResponse, error)
}

type msgClient struct {
	cc grpc1.ClientConn
}

func NewMsgClient(cc grpc1.ClientConn) MsgClient {
	return &msgClient{cc}
}

func (c *msgClient) TriggerGenesisEvent(ctx context.Context, in *MsgHubGenesisEvent, opts ...grpc.CallOption) (*MsgHubGenesisEventResponse, error) {
	out := new(MsgHubGenesisEventResponse)
	err := c.cc.Invoke(ctx, "/rollapp.hub_genesis.Msg/TriggerGenesisEvent", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// MsgServer is the server API for Msg service.
type MsgServer interface {
	TriggerGenesisEvent(context.Context, *MsgHubGenesisEvent) (*MsgHubGenesisEventResponse, error)
}

// UnimplementedMsgServer can be embedded to have forward compatible implementations.
type UnimplementedMsgServer struct {
}

func (*UnimplementedMsgServer) TriggerGenesisEvent(ctx context.Context, req *MsgHubGenesisEvent) (*MsgHubGenesisEventResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method TriggerGenesisEvent not implemented")
}

func RegisterMsgServer(s grpc1.Server, srv MsgServer) {
	s.RegisterService(&_Msg_serviceDesc, srv)
}

func _Msg_TriggerGenesisEvent_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(MsgHubGenesisEvent)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(MsgServer).TriggerGenesisEvent(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/rollapp.hub_genesis.Msg/TriggerGenesisEvent",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(MsgServer).TriggerGenesisEvent(ctx, req.(*MsgHubGenesisEvent))
	}
	return interceptor(ctx, in, info, handler)
}

var _Msg_serviceDesc = grpc.ServiceDesc{
	ServiceName: "rollapp.hub_genesis.Msg",
	HandlerType: (*MsgServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "TriggerGenesisEvent",
			Handler:    _Msg_TriggerGenesisEvent_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "hub-genesis/tx.proto",
}

func (m *MsgHubGenesisEvent) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *MsgHubGenesisEvent) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *MsgHubGenesisEvent) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if len(m.HubId) > 0 {
		i -= len(m.HubId)
		copy(dAtA[i:], m.HubId)
		i = encodeVarintTx(dAtA, i, uint64(len(m.HubId)))
		i--
		dAtA[i] = 0x1a
	}
	if len(m.ChannelId) > 0 {
		i -= len(m.ChannelId)
		copy(dAtA[i:], m.ChannelId)
		i = encodeVarintTx(dAtA, i, uint64(len(m.ChannelId)))
		i--
		dAtA[i] = 0x12
	}
	if len(m.Address) > 0 {
		i -= len(m.Address)
		copy(dAtA[i:], m.Address)
		i = encodeVarintTx(dAtA, i, uint64(len(m.Address)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func (m *MsgHubGenesisEventResponse) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *MsgHubGenesisEventResponse) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *MsgHubGenesisEventResponse) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	return len(dAtA) - i, nil
}

func encodeVarintTx(dAtA []byte, offset int, v uint64) int {
	offset -= sovTx(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *MsgHubGenesisEvent) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.Address)
	if l > 0 {
		n += 1 + l + sovTx(uint64(l))
	}
	l = len(m.ChannelId)
	if l > 0 {
		n += 1 + l + sovTx(uint64(l))
	}
	l = len(m.HubId)
	if l > 0 {
		n += 1 + l + sovTx(uint64(l))
	}
	return n
}

func (m *MsgHubGenesisEventResponse) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	return n
}

func sovTx(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozTx(x uint64) (n int) {
	return sovTx(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *MsgHubGenesisEvent) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowTx
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: MsgHubGenesisEvent: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: MsgHubGenesisEvent: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Address", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Address = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ChannelId", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ChannelId = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field HubId", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.HubId = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipTx(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthTx
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func (m *MsgHubGenesisEventResponse) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowTx
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: MsgHubGenesisEventResponse: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: MsgHubGenesisEventResponse: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		default:
			iNdEx = preIndex
			skippy, err := skipTx(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthTx
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipTx(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	depth := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowTx
			}
			if iNdEx >= l {
				return 0, io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		wireType := int(wire & 0x7)
		switch wireType {
		case 0:
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowTx
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
		case 1:
			iNdEx += 8
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowTx
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				length |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if length < 0 {
				return 0, ErrInvalidLengthTx
			}
			iNdEx += length
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return 0, ErrUnexpectedEndOfGroupTx
			}
			depth--
		case 5:
			iNdEx += 4
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
		if iNdEx < 0 {
			return 0, ErrInvalidLengthTx
		}
		if depth == 0 {
			return iNdEx, nil
		}
	}
	return 0, io.ErrUnexpectedEOF
}

var (
	ErrInvalidLengthTx        = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowTx          = fmt.Errorf("proto: integer overflow")
	ErrUnexpectedEndOfGroupTx = fmt.Errorf("proto: unexpected end of group")
)