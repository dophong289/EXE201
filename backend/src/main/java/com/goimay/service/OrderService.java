package com.goimay.service;

import com.goimay.dto.CreateOrderRequest;
import com.goimay.dto.OrderDTO;
import com.goimay.dto.OrderItemDTO;
import com.goimay.model.*;
import com.goimay.repository.OrderRepository;
import com.goimay.repository.ProductRepository;
import com.goimay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", new Locale("vi", "VN"));

    @Transactional
    public OrderDTO createOrder(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }
        if (isBlank(request.getFullName()) || isBlank(request.getPhone()) || isBlank(request.getAddress())) {
            throw new RuntimeException("Thiếu thông tin giao hàng");
        }

        Order order = new Order();
        order.setId(generateOrderId());
        order.setUser(user);
        order.setStatus(OrderStatus.CHO_XAC_NHAN);
        order.setPaymentMethod(parsePayment(request.getPaymentMethod()));
        order.setFullName(request.getFullName().trim());
        order.setPhone(request.getPhone().trim());
        order.setAddress(request.getAddress().trim());
        order.setEmail(request.getEmail());
        order.setNote(request.getNote());

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderRequest.CreateOrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) continue;
            int qty = itemReq.getQuantity() == null ? 1 : Math.max(1, itemReq.getQuantity());

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

            BigDecimal unitPrice = (product.getSalePrice() != null) ? product.getSalePrice() : product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(product.getId());
            item.setName(product.getName());
            item.setSlug(product.getSlug());
            item.setThumbnail(product.getThumbnail());
            item.setUnitPrice(unitPrice);
            item.setQuantity(qty);
            item.setLineTotal(lineTotal);

            order.getItems().add(item);
            subtotal = subtotal.add(lineTotal);
        }

        order.setSubtotal(subtotal);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTotal(subtotal);

        Order saved = orderRepository.save(order);
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getMyOrderById(String email, String orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDTO(order);
    }

    @Transactional
    public OrderDTO markReceived(String email, String orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.DA_HUY) {
            throw new RuntimeException("Đơn hàng đã bị hủy");
        }
        if (order.getStatus() == OrderStatus.GIAO_HANG_THANH_CONG) {
            return toDTO(order);
        }
        if (order.getStatus() != OrderStatus.DA_XAC_NHAN_DANG_CHUAN_BI) {
            throw new RuntimeException("Đơn hàng chưa ở trạng thái có thể xác nhận đã nhận");
        }

        order.setStatus(OrderStatus.GIAO_HANG_THANH_CONG);
        return toDTO(orderRepository.save(order));
    }

    // Admin
    @Transactional(readOnly = true)
    public List<OrderDTO> adminGetAllOrders() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO adminConfirm(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() == OrderStatus.DA_HUY) {
            throw new RuntimeException("Đơn đã hủy không thể xác nhận");
        }
        if (order.getStatus() == OrderStatus.GIAO_HANG_THANH_CONG) {
            throw new RuntimeException("Đơn đã giao thành công");
        }
        order.setStatus(OrderStatus.DA_XAC_NHAN_DANG_CHUAN_BI);
        return toDTO(orderRepository.save(order));
    }

    @Transactional
    public OrderDTO adminCancel(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() == OrderStatus.GIAO_HANG_THANH_CONG) {
            throw new RuntimeException("Đơn đã giao thành công không thể hủy");
        }
        order.setStatus(OrderStatus.DA_HUY);
        return toDTO(orderRepository.save(order));
    }

    private OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod().name());
        dto.setFullName(order.getFullName());
        dto.setPhone(order.getPhone());
        dto.setAddress(order.getAddress());
        dto.setEmail(order.getEmail());
        dto.setNote(order.getNote());
        dto.setSubtotal(order.getSubtotal());
        dto.setShippingFee(order.getShippingFee());
        dto.setTotal(order.getTotal());
        dto.setCreatedAt(order.getCreatedAt() != null ? DT.format(order.getCreatedAt()) : null);
        dto.setUpdatedAt(order.getUpdatedAt() != null ? DT.format(order.getUpdatedAt()) : null);
        dto.setItems(order.getItems().stream().map(it -> {
            OrderItemDTO i = new OrderItemDTO();
            i.setProductId(it.getProductId());
            i.setName(it.getName());
            i.setSlug(it.getSlug());
            i.setThumbnail(it.getThumbnail());
            i.setUnitPrice(it.getUnitPrice());
            i.setQuantity(it.getQuantity());
            i.setLineTotal(it.getLineTotal());
            return i;
        }).collect(Collectors.toList()));
        return dto;
    }

    private PaymentMethod parsePayment(String pm) {
        if (pm == null) return PaymentMethod.COD;
        try {
            return PaymentMethod.valueOf(pm.trim().toUpperCase());
        } catch (Exception e) {
            return PaymentMethod.COD;
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String generateOrderId() {
        String ts = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
        String rand = Long.toString(Math.abs(Double.doubleToLongBits(Math.random())), 36).toUpperCase();
        rand = rand.length() > 6 ? rand.substring(0, 6) : rand;
        return "GM-" + ts + "-" + rand;
    }
}

