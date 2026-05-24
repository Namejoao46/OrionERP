package backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.ProdutoFornecedor;

@Repository
public interface ProdutoFornecedorRepository extends JpaRepository<ProdutoFornecedor, Long> {

    Optional<ProdutoFornecedor> findByCnpjFornecedorAndCodigoFornecedor(
        String cnpjFornecedor, String codigoFornecedor
    );
}