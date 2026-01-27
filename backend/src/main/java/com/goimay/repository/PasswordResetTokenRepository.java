package com.goimay.repository;

import com.goimay.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByEmailAndOtpAndOtpVerifiedFalse(String email, String otp);
    
    Optional<PasswordResetToken> findByResetTokenAndOtpVerifiedTrue(String resetToken);
    
    @Modifying
    void deleteByEmail(String email);
    
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiryDate < :now")
    void deleteExpiredTokens(LocalDateTime now);
}
