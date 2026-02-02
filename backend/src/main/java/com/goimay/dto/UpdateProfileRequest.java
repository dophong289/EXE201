package com.goimay.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String address;
    private String birthDate; // format: yyyy-MM-dd
    private String gender; // MALE, FEMALE, OTHER
}
