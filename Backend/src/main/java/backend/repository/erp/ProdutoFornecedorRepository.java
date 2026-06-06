package backend.repository.erp;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.erp.ProdutoFornecedor;

@Repository
public interface ProdutoFornecedorRepository extends JpaRepository<ProdutoFornecedor, Long> {

    Optional<ProdutoFornecedor> findByCnpjFornecedorAndCodigoFornecedor(
        String cnpjFornecedor, String codigoFornecedor
    );
}