package com.goimay.repository;

import com.goimay.model.Order;
import com.goimay.model.OrderStatus;
import com.goimay.model.PaymentMethod;
import com.goimay.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    Optional<Order> findByIdAndUser(String id, User user);
    
    // Stats queries
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Order> findByCreatedAtAfter(LocalDateTime start);
    
    long countByStatus(OrderStatus status);
    long countByPaymentMethod(PaymentMethod paymentMethod);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :start ORDER BY o.createdAt ASC")
    List<Order> findOrdersFromDate(@Param("start") LocalDateTime start);
}

