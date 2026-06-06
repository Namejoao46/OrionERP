package backend.repository.gestao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.model.gestao.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    // Alterado de findByNome para findByNomeFantasia
    Optional<Empresa> findByNomeFantasia(String nomeFantasia);
}