package com.goimay.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String birthDate;
    private String gender;
    private String role;
    private String createdAt;
}
