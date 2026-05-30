package backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.model.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    // Alterado de findByNome para findByNomeFantasia
    Optional<Empresa> findByNomeFantasia(String nomeFantasia);
}