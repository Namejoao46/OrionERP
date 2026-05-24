package backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.ItemNotaRecebimento;

@Repository
public interface ItemNotaRecebimentoRepository extends JpaRepository<ItemNotaRecebimento, Long> {

    List<ItemNotaRecebimento> findByNotaId(Long notaId);
}