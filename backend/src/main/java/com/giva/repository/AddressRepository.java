package com.giva.repository;

import com.giva.model.Address;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUser_IdOrderByDefaultAddressDescCreatedAtDesc(UUID userId);

    Optional<Address> findByIdAndUser_Id(UUID id, UUID userId);
}
