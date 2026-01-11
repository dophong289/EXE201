package com.goimay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String thumbnail;
    private String author;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private boolean featured;
    private boolean published;
    private String categoryName;
    private Long categoryId;
}

