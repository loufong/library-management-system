package com.example.library.repository;

import com.example.library.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    List<Loan> findByStatus(String status);
    List<Loan> findByUserIdAndStatus(Long userId, String status);
}
