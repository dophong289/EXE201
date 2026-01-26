package com.goimay.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_set_id", nullable = false)
    private MenuSet menuSet;
    
    @Column(nullable = false)
    private String product;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private Integer price;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
