package backend.repository.erp;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import backend.model.erp.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // 🧠 CORREÇÃO: SQL Nativo limpo que o Firebird processa instantaneamente e sem erros de sintaxe
    @Query(value = "SELECT * FROM PRODUTOS WHERE fornecedor_id = :fornecedorId", nativeQuery = true)
    List<Produto> findByFornecedorId(@Param("fornecedorId") Long fornecedorId);

    Optional<Produto> findByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarras(String codigoBarras);

    List<Produto> findByStatus(String status);

    @Query("SELECT p FROM Produto p WHERE LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Produto> buscarPorDescricao(@Param("termo") String termo);
}